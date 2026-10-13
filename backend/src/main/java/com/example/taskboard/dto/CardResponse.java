package com.example.taskboard.dto;

import com.example.taskboard.entity.Card;

// API で返すカードのデータの形
public record CardResponse(Long id, String content, Integer position) {

	public static CardResponse from(Card card) {
		return new CardResponse(card.getId(), card.getContent(), card.getPosition());
	}
}
