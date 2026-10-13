package com.example.taskboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.repository.TaskListRepository;

// ボード（リストとカード）に関する処理をまとめるクラス
@Service
public class BoardService {

	private final TaskListRepository taskListRepository;

	public BoardService(TaskListRepository taskListRepository) {
		this.taskListRepository = taskListRepository;
	}

	// すべてのリストを、中のカードと一緒に並び順で取得する
	@Transactional(readOnly = true)
	public List<ListResponse> getBoard() {
		return taskListRepository.findAllByOrderByPositionAsc().stream()
				.map(ListResponse::from)
				.toList();
	}
}
