package main

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ==================== Health ====================

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "timestamp": time.Now()})
}

// ==================== Users ====================

func CreateOrGetUser(c *gin.Context) {
	var body struct {
		LineUserID  string `json:"line_user_id" binding:"required"`
		DisplayName string `json:"display_name"`
		PictureURL  string `json:"picture_url"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	result := DB.Where("line_user_id = ?", body.LineUserID).First(&user)
	if result.Error != nil {
		// User doesn't exist, create
		user = User{
			LineUserID:  body.LineUserID,
			DisplayName: body.DisplayName,
			PictureURL:  body.PictureURL,
			TotalCoins:  0,
		}
		if err := DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else {
		// Update display name and picture if provided
		updates := map[string]interface{}{}
		if body.DisplayName != "" {
			updates["display_name"] = body.DisplayName
		}
		if body.PictureURL != "" {
			updates["picture_url"] = body.PictureURL
		}
		if len(updates) > 0 {
			DB.Model(&user).Updates(updates)
		}
	}

	c.JSON(http.StatusOK, user)
}

func GetUser(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func GetUserStats(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var totalSwipes int64
	DB.Model(&Swipe{}).Where("user_id = ?", user.ID).Count(&totalSwipes)

	var likedPlaces int64
	DB.Model(&Swipe{}).Where("user_id = ? AND direction = ?", user.ID, "right").Count(&likedPlaces)

	var dislikedPlaces int64
	DB.Model(&Swipe{}).Where("user_id = ? AND direction = ?", user.ID, "left").Count(&dislikedPlaces)

	var journeysCompleted int64
	DB.Model(&Journey{}).Where("user_id = ? AND is_completed = ?", user.ID, true).Count(&journeysCompleted)

	// Count photos uploaded: sum of visited places across all journeys
	var journeys []Journey
	DB.Where("user_id = ?", user.ID).Find(&journeys)
	var photosUploaded int
	for _, j := range journeys {
		photosUploaded += len(j.VisitedPlaceIDs)
	}

	c.JSON(http.StatusOK, gin.H{
		"total_swipes":       totalSwipes,
		"liked_places":       likedPlaces,
		"disliked_places":    dislikedPlaces,
		"total_coins":        user.TotalCoins,
		"journeys_completed": journeysCompleted,
		"photos_uploaded":    photosUploaded,
	})
}

// ==================== Places ====================

func GetPlaces(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	query := DB.Model(&Place{}).Where("is_active = ?", true)

	// Filter by single city
	if city := c.Query("city"); city != "" {
		query = query.Where("city = ?", city)
	}

	// Filter by multiple cities (comma-separated)
	if cities := c.Query("cities"); cities != "" {
		cityList := strings.Split(cities, ",")
		for i := range cityList {
			cityList[i] = strings.TrimSpace(cityList[i])
		}
		query = query.Where("city IN ?", cityList)
	}

	// Filter by tag (search within JSON tags)
	if tag := c.Query("tag"); tag != "" {
		query = query.Where("tags LIKE ?", "%"+tag+"%")
	}

	var total int64
	query.Count(&total)

	var places []Place
	offset := (page - 1) * perPage
	if err := query.Offset(offset).Limit(perPage).Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"places":   places,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}

func GetPlace(c *gin.Context) {
	id := c.Param("id")
	var place Place
	if err := DB.First(&place, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}
	c.JSON(http.StatusOK, place)
}

func GetCities(c *gin.Context) {
	type CityCount struct {
		Name       string `json:"name"`
		PlaceCount int64  `json:"place_count"`
	}

	var results []CityCount
	DB.Model(&Place{}).
		Select("city as name, count(*) as place_count").
		Where("is_active = ?", true).
		Group("city").
		Order("place_count DESC").
		Find(&results)

	c.JSON(http.StatusOK, gin.H{"cities": results})
}

// ==================== Tinder / Swipes ====================

func GetTinderPlaces(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	query := DB.Where("is_active = ? AND id NOT IN (?)", true,
		DB.Model(&Swipe{}).Select("place_id").Where("user_id = ?", user.ID))

	// Filter by cities
	if cities := c.Query("cities"); cities != "" {
		cityList := strings.Split(cities, ",")
		for i := range cityList {
			cityList[i] = strings.TrimSpace(cityList[i])
		}
		query = query.Where("city IN ?", cityList)
	}

	var places []Place
	if err := query.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"places": places, "total": len(places)})
}

func CreateSwipe(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var body struct {
		PlaceID   uint   `json:"place_id" binding:"required"`
		Direction string `json:"direction" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Direction != "left" && body.Direction != "right" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Direction must be 'left' or 'right'"})
		return
	}

	// Check place exists
	var place Place
	if err := DB.First(&place, body.PlaceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}

	swipe := Swipe{
		UserID:    user.ID,
		PlaceID:   body.PlaceID,
		Direction: body.Direction,
	}
	if err := DB.Create(&swipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create swipe"})
		return
	}

	c.JSON(http.StatusCreated, swipe)
}

// ==================== Liked Places ====================

func GetLikedPlaces(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var swipes []Swipe
	DB.Preload("Place").Where("user_id = ? AND direction = ?", user.ID, "right").Find(&swipes)

	places := make([]Place, 0, len(swipes))
	for _, s := range swipes {
		places = append(places, s.Place)
	}

	c.JSON(http.StatusOK, gin.H{"places": places, "total": len(places)})
}

func RemoveLikedPlace(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	placeID := c.Param("placeId")

	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	result := DB.Where("user_id = ? AND place_id = ? AND direction = ?", user.ID, placeID, "right").Delete(&Swipe{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Liked place not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Liked place removed"})
}

func ClearLikedPlaces(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	DB.Where("user_id = ? AND direction = ?", user.ID, "right").Delete(&Swipe{})

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All liked places cleared"})
}

// ==================== Preferences ====================

func GetPreferences(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var pref UserPreference
	if err := DB.Where("user_id = ?", user.ID).First(&pref).Error; err != nil {
		// Return empty preferences
		c.JSON(http.StatusOK, gin.H{
			"user_id":            user.ID,
			"selected_cities":    []string{},
			"travel_personality": "",
			"preferred_tags":     []string{},
		})
		return
	}

	c.JSON(http.StatusOK, pref)
}

func UpdatePreferences(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var body struct {
		SelectedCities    []string `json:"selected_cities"`
		TravelPersonality string   `json:"travel_personality"`
		PreferredTags     []string `json:"preferred_tags"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var pref UserPreference
	result := DB.Where("user_id = ?", user.ID).First(&pref)
	if result.Error != nil {
		// Create new
		pref = UserPreference{
			UserID:            user.ID,
			SelectedCities:    JSONStringSlice(body.SelectedCities),
			TravelPersonality: body.TravelPersonality,
			PreferredTags:     JSONStringSlice(body.PreferredTags),
		}
		DB.Create(&pref)
	} else {
		// Update existing
		pref.SelectedCities = JSONStringSlice(body.SelectedCities)
		pref.TravelPersonality = body.TravelPersonality
		pref.PreferredTags = JSONStringSlice(body.PreferredTags)
		pref.UpdatedAt = time.Now()
		DB.Save(&pref)
	}

	c.JSON(http.StatusOK, pref)
}

// ==================== Journeys ====================

func CreateJourney(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var body struct {
		Personality string `json:"personality"`
		Duration    string `json:"duration"`
		PlaceIDs    []uint `json:"place_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	journey := Journey{
		UserID:          user.ID,
		Personality:     body.Personality,
		Duration:        body.Duration,
		PlaceIDs:        JSONUintSlice(body.PlaceIDs),
		VisitedPlaceIDs: JSONUintSlice{},
		TotalCoinsEarned: 0,
		IsCompleted:     false,
		StartedAt:       time.Now(),
	}

	if err := DB.Create(&journey).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create journey"})
		return
	}

	c.JSON(http.StatusCreated, journey)
}

func GetCurrentJourney(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var journey Journey
	if err := DB.Where("user_id = ? AND is_completed = ?", user.ID, false).
		Order("started_at DESC").First(&journey).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active journey found"})
		return
	}

	c.JSON(http.StatusOK, journey)
}

func VisitPlace(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	journeyID := c.Param("journeyId")

	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var journey Journey
	if err := DB.Where("id = ? AND user_id = ?", journeyID, user.ID).First(&journey).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Journey not found"})
		return
	}

	if journey.IsCompleted {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Journey is already completed"})
		return
	}

	var body struct {
		PlaceID uint     `json:"place_id" binding:"required"`
		Photos  []string `json:"photos"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if place is already visited
	for _, pid := range journey.VisitedPlaceIDs {
		if pid == body.PlaceID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Place already visited in this journey"})
			return
		}
	}

	// Award coins: 10 per photo
	coinsEarned := len(body.Photos) * 10

	// Update journey
	journey.VisitedPlaceIDs = append(journey.VisitedPlaceIDs, body.PlaceID)
	journey.TotalCoinsEarned += coinsEarned

	// Check if journey is completed (all places visited)
	journeyCompleted := len(journey.VisitedPlaceIDs) >= len(journey.PlaceIDs)
	if journeyCompleted {
		journey.IsCompleted = true
		now := time.Now()
		journey.CompletedAt = &now
	}

	DB.Save(&journey)

	// Update user coins
	user.TotalCoins += coinsEarned
	DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"success":           true,
		"coins_earned":      coinsEarned,
		"total_coins":       user.TotalCoins,
		"journey_completed": journeyCompleted,
	})
}

// ==================== Rewards ====================

func GetRewards(c *gin.Context) {
	var rewards []Reward
	DB.Find(&rewards)
	c.JSON(http.StatusOK, gin.H{"rewards": rewards})
}

func RedeemReward(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var body struct {
		RewardID uint `json:"reward_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var reward Reward
	if err := DB.First(&reward, body.RewardID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reward not found"})
		return
	}

	if user.TotalCoins < reward.CoinCost {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Insufficient coins",
		})
		return
	}

	// Deduct coins
	user.TotalCoins -= reward.CoinCost
	DB.Save(&user)

	// Create redeemed record
	redeemed := RedeemedReward{
		UserID:     user.ID,
		RewardID:   reward.ID,
		RedeemedAt: time.Now(),
	}
	DB.Create(&redeemed)

	c.JSON(http.StatusOK, gin.H{
		"success":         true,
		"message":         "Reward redeemed successfully",
		"discount_code":   reward.DiscountCode,
		"remaining_coins": user.TotalCoins,
	})
}

func GetRedeemedRewards(c *gin.Context) {
	lineUserID := c.Param("lineUserId")
	var user User
	if err := DB.Where("line_user_id = ?", lineUserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var redeemed []RedeemedReward
	DB.Preload("Reward").Where("user_id = ?", user.ID).Find(&redeemed)

	c.JSON(http.StatusOK, gin.H{"redeemed_rewards": redeemed})
}
