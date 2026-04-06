package main

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// JSONStringSlice is a custom type for storing string slices as JSON in SQLite.
type JSONStringSlice []string

func (j JSONStringSlice) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	b, err := json.Marshal(j)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (j *JSONStringSlice) Scan(value interface{}) error {
	if value == nil {
		*j = []string{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
	return json.Unmarshal(bytes, j)
}

// JSONUintSlice is a custom type for storing uint slices as JSON in SQLite.
type JSONUintSlice []uint

func (j JSONUintSlice) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	b, err := json.Marshal(j)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (j *JSONUintSlice) Scan(value interface{}) error {
	if value == nil {
		*j = []uint{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
	return json.Unmarshal(bytes, j)
}

type User struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	LineUserID string    `json:"line_user_id" gorm:"uniqueIndex;not null"`
	DisplayName string   `json:"display_name"`
	PictureURL string    `json:"picture_url"`
	TotalCoins int       `json:"total_coins" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
}

type Place struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	ExternalID  string `json:"external_id"`
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	ImageURL    string  `json:"image_url"`
	Country     string  `json:"country"`
	City        string  `json:"city"`
	Rating      float64 `json:"rating"`
	Tags        JSONStringSlice `json:"tags" gorm:"type:text"`
	IsActive    bool    `json:"is_active" gorm:"default:true"`
}

type Swipe struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	PlaceID   uint      `json:"place_id" gorm:"index"`
	Direction string    `json:"direction"` // "left" or "right"
	CreatedAt time.Time `json:"created_at"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
	Place     Place     `json:"place,omitempty" gorm:"foreignKey:PlaceID"`
}

type UserPreference struct {
	ID                uint            `json:"id" gorm:"primaryKey"`
	UserID            uint            `json:"user_id" gorm:"uniqueIndex"`
	SelectedCities    JSONStringSlice `json:"selected_cities" gorm:"type:text"`
	TravelPersonality string          `json:"travel_personality"`
	PreferredTags     JSONStringSlice `json:"preferred_tags" gorm:"type:text"`
	UpdatedAt         time.Time       `json:"updated_at"`
	User              User            `json:"-" gorm:"foreignKey:UserID"`
}

type Journey struct {
	ID              uint            `json:"id" gorm:"primaryKey"`
	UserID          uint            `json:"user_id" gorm:"index"`
	Personality     string          `json:"personality"`
	Duration        string          `json:"duration"`
	PlaceIDs        JSONUintSlice   `json:"place_ids" gorm:"type:text"`
	VisitedPlaceIDs JSONUintSlice   `json:"visited_place_ids" gorm:"type:text"`
	TotalCoinsEarned int            `json:"total_coins_earned" gorm:"default:0"`
	IsCompleted     bool            `json:"is_completed" gorm:"default:false"`
	StartedAt       time.Time       `json:"started_at"`
	CompletedAt     *time.Time      `json:"completed_at"`
	User            User            `json:"-" gorm:"foreignKey:UserID"`
}

type Reward struct {
	ID            uint    `json:"id" gorm:"primaryKey"`
	Name          string  `json:"name" gorm:"not null"`
	Description   string  `json:"description"`
	ImageURL      string  `json:"image_url"`
	CoinCost      int     `json:"coin_cost"`
	Category      string  `json:"category"`
	DiscountCode  string  `json:"discount_code"`
	ValidUntil    string  `json:"valid_until"`
	Location      string  `json:"location"`
	OriginalPrice float64 `json:"original_price"`
}

type RedeemedReward struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"index"`
	RewardID   uint      `json:"reward_id" gorm:"index"`
	RedeemedAt time.Time `json:"redeemed_at"`
	User       User      `json:"-" gorm:"foreignKey:UserID"`
	Reward     Reward    `json:"reward,omitempty" gorm:"foreignKey:RewardID"`
}
