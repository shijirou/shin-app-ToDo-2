package com.example.taskboard.dto;

import java.util.List;

import com.example.taskboard.entity.TaskList;

// API で返すリストのデータの形（中のカードも含む）
public record ListResponse(Long id, String name, Integer position, List<CardResponse> cards) {

	public static ListResponse from(TaskList list) {
		List<CardResponse> cards = list.getCards().stream().map(CardResponse::from).toList();
		return new ListResponse(list.getId(), list.getName(), list.getPosition(), cards);
	}
}
