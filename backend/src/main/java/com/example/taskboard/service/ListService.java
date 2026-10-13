package com.example.taskboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.exception.NotFoundException;
import com.example.taskboard.repository.TaskListRepository;

// リストに関する処理をまとめるクラス
@Service
public class ListService {

	private final TaskListRepository taskListRepository;

	public ListService(TaskListRepository taskListRepository) {
		this.taskListRepository = taskListRepository;
	}

	// すべてのリストを、中のカードと一緒に並び順で取得する
	@Transactional(readOnly = true)
	public List<ListResponse> getBoard() {
		return taskListRepository.findAllByOrderByPositionAsc().stream()
				.map(ListResponse::from)
				.toList();
	}

	// リストを追加する（いちばん右に入れる）
	@Transactional
	public ListResponse createList(String name) {
		int position = taskListRepository.findMaxPosition() + 1;
		TaskList list = taskListRepository.save(new TaskList(name, position));
		return ListResponse.from(list);
	}

	// リストの名前を変える（@Transactional の中で値を変えると、DB にも自動で保存される）
	@Transactional
	public ListResponse renameList(Long id, String name) {
		TaskList list = findList(id);
		list.rename(name);
		return ListResponse.from(list);
	}

	// リストを削除する（中のカードは DB の設定 on delete cascade で一緒に消える）
	@Transactional
	public void deleteList(Long id) {
		taskListRepository.delete(findList(id));
	}

	// 番号でリストを探す。なければ「見つからない」エラー（404）にする
	private TaskList findList(Long id) {
		return taskListRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("リストが見つかりません: " + id));
	}
}
