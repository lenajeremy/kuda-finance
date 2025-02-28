package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uuid.UUID      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (m *BaseModel) BeforeCreate(tx *gorm.DB) error {
	m.ID = uuid.New()
	return nil
}

type UserRole string

const (
	ROLEUSER UserRole = "user"
	ROLEBOT  UserRole = "model"
)

type Message struct {
	BaseModel
	Content        string    `json:"content" gorm:"content"`
	Role           UserRole  `json:"role" gorm:"role"`
	ConversationId uuid.UUID `gorm:"conversationId"`
	Conversation   Conversation
}

type Conversation struct {
	BaseModel
	Messages []Message
}
