package com.example.taskboard.service;

import java.util.ArrayList;
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
		return taskListRepository.findAllWithCards().stream()
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

	// リストを並び替える（左から position 番目に置く）。
	// ほかのリストも含めて、並び順を 0, 1, 2… に付け直す
	@Transactional
	public void moveList(Long id, int position) {
		TaskList list = findList(id);
		List<TaskList> lists = new ArrayList<>(taskListRepository.findAllByOrderByPositionAsc());
		lists.remove(list);
		int index = Math.min(position, lists.size()); // 最後より後ろを指定されたら、いちばん右に置く
		lists.add(index, list);
		for (int i = 0; i < lists.size(); i++) {
			lists.get(i).changePosition(i);
		}
	}

	// 番号でリストを探す。なければ「見つからない」エラー（404）にする
	private TaskList findList(Long id) {
		return taskListRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("リストが見つかりません: " + id));
	}
}
