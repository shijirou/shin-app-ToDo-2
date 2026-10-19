package com.example.taskboard.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.taskboard.dto.CardResponse;
import com.example.taskboard.dto.ListResponse;
import com.example.taskboard.entity.Priority;
import com.example.taskboard.service.ListService;

// リストの API のテスト。サーバーを起動せずに、API の入り口（Controller）とエラーの返し方だけを試す
@WebMvcTest(ListController.class)
class ListControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ListService listService;

	@Test
	void ボードを読むと_リストと中のカードがJSONで返る() throws Exception {
		when(listService.getBoard()).thenReturn(List.of(
				new ListResponse(1L, "ToDo", 0, List.of(new CardResponse(1L, "買い物", Priority.HIGH, 0))),
				new ListResponse(2L, "完了", 1, List.of())));

		mockMvc.perform(get("/api/lists"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("ToDo"))
				.andExpect(jsonPath("$[0].cards[0].content").value("買い物"))
				.andExpect(jsonPath("$[0].cards[0].priority").value("HIGH"))
				.andExpect(jsonPath("$[1].cards.length()").value(0));
	}

	@Test
	void リストを追加すると201が返り_名前の前後の空白は取り除かれる() throws Exception {
		when(listService.createList("あとで")).thenReturn(new ListResponse(4L, "あとで", 3, List.of()));

		mockMvc.perform(post("/api/lists").contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"　あとで  \"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("あとで"));
	}

	@Test
	void リスト名が101文字なら400と_文字数のメッセージが返る() throws Exception {
		String name = "あ".repeat(101);

		mockMvc.perform(post("/api/lists").contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"" + name + "\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("リスト名は100文字以内で入力してください"));
		verify(listService, never()).createList(any());
	}

	@Test
	void ないURLなら404と_そのURLはありませんのメッセージが返る() throws Exception {
		mockMvc.perform(get("/api/nothing"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("その URL はありません"));
	}
}
