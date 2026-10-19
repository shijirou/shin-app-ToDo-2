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

import com.example.taskboard.dto.CardResponse;
import com.example.taskboard.entity.Card;
import com.example.taskboard.entity.Priority;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.exception.NotFoundException;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

// CardService のテスト。DB の代わりに Mockito の「偽物のリポジトリ」を使うので、DB を起動しなくても動く
@ExtendWith(MockitoExtension.class)
class CardServiceTest {

	@Mock
	private CardRepository cardRepository;

	@Mock
	private TaskListRepository taskListRepository;

	@InjectMocks
	private CardService cardService;

	// テスト用のリストを作る（id は DB が付けるものなので、テストでは直接入れる）
	private static TaskList list(long id, String name) {
		TaskList list = new TaskList(name, 0);
		ReflectionTestUtils.setField(list, "id", id);
		return list;
	}

	// テスト用のカードを作る
	private static Card card(long id, TaskList list, String content, int position) {
		Card card = new Card(list, content, Priority.MEDIUM, position);
		ReflectionTestUtils.setField(card, "id", id);
		return card;
	}

	@Test
	void カードを追加すると_リストのいちばん下に入り_重要度がなければ中になる() {
		TaskList todo = list(1, "ToDo");
		when(taskListRepository.findById(1L)).thenReturn(Optional.of(todo));
		when(cardRepository.findMaxPositionByListId(1L)).thenReturn(1); // 今は 0, 1 番目のカードがある
		when(cardRepository.save(any(Card.class))).thenAnswer(inv -> inv.getArgument(0));

		CardResponse result = cardService.createCard(1L, "買い物", null);

		assertThat(result.position()).isEqualTo(2);
		assertThat(result.priority()).isEqualTo(Priority.MEDIUM);
		assertThat(result.content()).isEqualTo("買い物");
	}

	@Test
	void ないリストにカードを追加すると_見つからないエラーになる() {
		when(taskListRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> cardService.createCard(99L, "買い物", Priority.HIGH))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("リストが見つかりません: 99");
	}

	@Test
	void 重要度を送らずに更新すると_重要度は今のまま() {
		Card a = card(1, list(1, "ToDo"), "前の内容", 0);
		a.changePriority(Priority.HIGH);
		when(cardRepository.findById(1L)).thenReturn(Optional.of(a));

		CardResponse result = cardService.updateCard(1L, "新しい内容", null);

		assertThat(result.content()).isEqualTo("新しい内容");
		assertThat(result.priority()).isEqualTo(Priority.HIGH);
	}

	@Test
	void 同じリストの中で_いちばん下のカードを先頭へ動かす() {
		TaskList todo = list(1, "ToDo");
		Card a = card(1, todo, "A", 0);
		Card b = card(2, todo, "B", 1);
		Card c = card(3, todo, "C", 2);
		when(cardRepository.findById(3L)).thenReturn(Optional.of(c));
		when(taskListRepository.findById(1L)).thenReturn(Optional.of(todo));
		when(cardRepository.findByListIdOrderByPositionAsc(1L)).thenReturn(List.of(a, b, c));

		cardService.moveCard(3L, 1L, 0);

		// C, A, B の順になり、番号が 0, 1, 2 に付け直される
		assertThat(c.getPosition()).isEqualTo(0);
		assertThat(a.getPosition()).isEqualTo(1);
		assertThat(b.getPosition()).isEqualTo(2);
	}

	@Test
	void 別のリストへ動かすと_移動元と移動先の両方の番号が付け直される() {
		TaskList todo = list(1, "ToDo");
		TaskList doing = list(2, "進行中");
		Card a = card(1, todo, "A", 0);
		Card b = card(2, todo, "B", 1);
		Card c = card(3, todo, "C", 2);
		Card d = card(4, doing, "D", 0);
		Card e = card(5, doing, "E", 1);
		when(cardRepository.findById(2L)).thenReturn(Optional.of(b));
		when(taskListRepository.findById(2L)).thenReturn(Optional.of(doing));
		when(cardRepository.findByListIdOrderByPositionAsc(1L)).thenReturn(List.of(a, b, c));
		when(cardRepository.findByListIdOrderByPositionAsc(2L)).thenReturn(List.of(d, e));

		cardService.moveCard(2L, 2L, 1); // B を「進行中」の 1 番目（D と E の間）へ

		// 移動元: A, C → 0, 1（B の抜けた穴が詰まる）
		assertThat(a.getPosition()).isEqualTo(0);
		assertThat(c.getPosition()).isEqualTo(1);
		// 移動先: D, B, E → 0, 1, 2
		assertThat(d.getPosition()).isEqualTo(0);
		assertThat(b.getPosition()).isEqualTo(1);
		assertThat(e.getPosition()).isEqualTo(2);
		assertThat(b.getList()).isSameAs(doing);
	}

	@Test
	void 最後より後ろの位置を指定すると_いちばん下に入る() {
		TaskList todo = list(1, "ToDo");
		TaskList done = list(3, "完了");
		Card a = card(1, todo, "A", 0);
		Card x = card(6, done, "X", 0);
		when(cardRepository.findById(1L)).thenReturn(Optional.of(a));
		when(taskListRepository.findById(3L)).thenReturn(Optional.of(done));
		when(cardRepository.findByListIdOrderByPositionAsc(1L)).thenReturn(List.of(a));
		when(cardRepository.findByListIdOrderByPositionAsc(3L)).thenReturn(List.of(x));

		cardService.moveCard(1L, 3L, 100);

		assertThat(x.getPosition()).isEqualTo(0);
		assertThat(a.getPosition()).isEqualTo(1);
	}

	@Test
	void ないカードを動かすと_見つからないエラーになる() {
		when(cardRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> cardService.moveCard(99L, 1L, 0))
				.isInstanceOf(NotFoundException.class)
				.hasMessage("カードが見つかりません: 99");
	}
}
