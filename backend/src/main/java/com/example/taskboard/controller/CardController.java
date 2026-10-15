package com.example.taskboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.CardCreateRequest;
import com.example.taskboard.dto.CardMoveRequest;
import com.example.taskboard.dto.CardResponse;
import com.example.taskboard.dto.CardUpdateRequest;
import com.example.taskboard.service.CardService;

import jakarta.validation.Valid;

// カードの API の入り口
@RestController
@RequestMapping("/api/cards")
public class CardController {

	private final CardService cardService;

	public CardController(CardService cardService) {
		this.cardService = cardService;
	}

	// POST /api/cards: カードを追加する（成功したら 201）
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CardResponse createCard(@Valid @RequestBody CardCreateRequest request) {
		return cardService.createCard(request.listId(), request.content(), request.priority());
	}

	// PATCH /api/cards/{id}: カードの内容・重要度を変える
	@PatchMapping("/{id}")
	public CardResponse updateCard(@PathVariable Long id, @Valid @RequestBody CardUpdateRequest request) {
		return cardService.updateCard(id, request.content(), request.priority());
	}

	// PATCH /api/cards/{id}/move: カードを並び替える・別のリストへ移す（成功したら 204）
	@PatchMapping("/{id}/move")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void moveCard(@PathVariable Long id, @Valid @RequestBody CardMoveRequest request) {
		cardService.moveCard(id, request.listId(), request.position());
	}

	// DELETE /api/cards/{id}: カードを削除する（成功したら 204）
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCard(@PathVariable Long id) {
		cardService.deleteCard(id);
	}
}
