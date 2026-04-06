package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	InitDB()

	// Seed data
	SeedData()

	// Create Gin router
	r := gin.Default()

	// CORS middleware - allow all origins for development
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Health check
	r.GET("/api/health", HealthCheck)

	// Users
	r.POST("/api/users", CreateOrGetUser)
	r.GET("/api/users/:lineUserId", GetUser)
	r.GET("/api/users/:lineUserId/stats", GetUserStats)

	// Places
	r.GET("/api/places", GetPlaces)
	r.GET("/api/places/:id", GetPlace)
	r.GET("/api/cities", GetCities)

	// Tinder / Swipes
	r.GET("/api/users/:lineUserId/tinder-places", GetTinderPlaces)
	r.POST("/api/users/:lineUserId/swipes", CreateSwipe)

	// Liked Places
	r.GET("/api/users/:lineUserId/liked-places", GetLikedPlaces)
	r.DELETE("/api/users/:lineUserId/liked-places/:placeId", RemoveLikedPlace)
	r.DELETE("/api/users/:lineUserId/liked-places", ClearLikedPlaces)

	// Preferences
	r.GET("/api/users/:lineUserId/preferences", GetPreferences)
	r.PUT("/api/users/:lineUserId/preferences", UpdatePreferences)

	// Journeys
	r.POST("/api/users/:lineUserId/journeys", CreateJourney)
	r.GET("/api/users/:lineUserId/journeys/current", GetCurrentJourney)
	r.POST("/api/users/:lineUserId/journeys/:journeyId/visit", VisitPlace)

	// Rewards
	r.GET("/api/rewards", GetRewards)
	r.POST("/api/users/:lineUserId/rewards/redeem", RedeemReward)
	r.GET("/api/users/:lineUserId/rewards/redeemed", GetRedeemedRewards)

	// Start server
	log.Println("Server starting on port 8000...")
	if err := r.Run(":8000"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
