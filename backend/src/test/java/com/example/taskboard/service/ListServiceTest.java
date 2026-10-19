package com.example.taskboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.exception.NotFoundException;
import com.example.taskboard.repository.TaskListRepository;

// ListService のテスト。DB の代わりに Mockito の「偽物のリポジトリ」を使う
@ExtendWith(MockitoExtension.class)
class ListServiceTest {

	@Mock
	private TaskListRepository taskListRepository;

	@InjectMocks
	private ListService listService;

	// テスト用のリストを作る（id は DB が付けるものなので、テストでは直接入れる）
	private static TaskList list(long id, String name, int position) {
		TaskList list = new TaskList(name, position);
		ReflectionTestUtils.setField(list, "id", id);
		return list;
	}

	@Test
	void リストを追加すると_いちばん右に入る() {
		when(taskListRepository.findMaxPosition()).thenReturn(2); // 今は 0, 1, 2 番目のリストがある
		when(taskListRepository.save(any(TaskList.class))).thenAnswer(inv -> inv.getArgument(0));

		ListResponse result = listService.createList("あとで");

		assertThat(result.position()).isEqualTo(3);
		assertThat(result.name()).isEqualTo("あとで");
		assertThat(result.cards()).isEmpty();
	}

	@Test
	void いちばん右のリストを左端へ動かす() {
		TaskList todo = list(1, "ToDo", 0);
		TaskList doing = list(2, "進行中", 1);
		TaskList done = list(3, "完了", 2);
		when(taskListRepository.findById(3L)).thenReturn(Optional.of(done));
		when(taskListRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(todo, doing, done));

		listService.moveList(3L, 0);

		// 完了, ToDo, 進行中 の順になり、番号が 0, 1, 2 に付け直される
		assertThat(done.getPosition()).isEqualTo(0);
		assertThat(todo.getPosition()).isEqualTo(1);
		assertThat(doing.getPosition()).isEqualTo(2);
	}

	@Test
	void 最後より後ろの位置を指定すると_いちばん右に置く() {
		TaskList todo = list(1, "ToDo", 0);
		TaskList doing = list(2, "進行中", 1);
		when(taskListRepository.findById(1L)).thenReturn(Optional.of(todo));
		when(taskListRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(todo, doing));

		listService.moveList(1L, 100);

		assertThat(doing.getPosition()).isEqualTo(0);
		assertThat(todo.getPosition()).isEqualTo(1);
	}

	@Test
	void ないリストの名前を変えると_見つからないエラーになる() {
		when(taskListRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> listService.renameList(99L, "新しい名前"))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("リストが見つかりません: 99");
	}
}
