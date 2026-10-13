package com.example.taskboard.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.ListRequest;
import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.service.ListService;

import jakarta.validation.Valid;

// リストの API の入り口
@RestController
@RequestMapping("/api/lists")
public class ListController {

	private final ListService listService;

	public ListController(ListService listService) {
		this.listService = listService;
	}

	// GET /api/lists: すべてのリストと、その中のカードを返す
	@GetMapping
	public List<ListResponse> getLists() {
		return listService.getBoard();
	}

	// POST /api/lists: リストを追加する（成功したら 201）
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ListResponse createList(@Valid @RequestBody ListRequest request) {
		return listService.createList(request.name());
	}

	// PATCH /api/lists/{id}: リストの名前を変える
	@PatchMapping("/{id}")
	public ListResponse updateList(@PathVariable Long id, @Valid @RequestBody ListRequest request) {
		return listService.renameList(id, request.name());
	}

	// DELETE /api/lists/{id}: リストを削除する（成功したら 204）
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteList(@PathVariable Long id) {
		listService.deleteList(id);
	}
}
