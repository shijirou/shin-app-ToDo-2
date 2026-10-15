package com.example.taskboard.dto;

import com.example.taskboard.entity.Card;
import com.example.taskboard.entity.Priority;

// API で返すカードのデータの形
public record CardResponse(Long id, String content, Priority priority, Integer position) {

	public static CardResponse from(Card card) {
		return new CardResponse(card.getId(), card.getContent(), card.getPriority(), card.getPosition());
	}
}
