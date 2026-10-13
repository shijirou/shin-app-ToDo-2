package com.example.taskboard.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.service.BoardService;

// リストの API の入り口
@RestController
@RequestMapping("/api/lists")
public class ListController {

	private final BoardService boardService;

	public ListController(BoardService boardService) {
		this.boardService = boardService;
	}

	// GET /api/lists: すべてのリストと、その中のカードを返す
	@GetMapping
	public List<ListResponse> getLists() {
		return boardService.getBoard();
	}
}
