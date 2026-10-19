package com.example.taskboard.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.taskboard.dto.CardResponse;
import com.example.taskboard.entity.Priority;
import com.example.taskboard.exception.NotFoundException;
import com.example.taskboard.service.CardService;

// カードの API のテスト。サーバーを起動せずに、API の入り口（Controller）とエラーの返し方だけを試す。
// 中の処理（CardService）は Mockito の偽物にしているので、DB は使わない
@WebMvcTest(CardController.class)
class CardControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private CardService cardService;

	@Test
	void カードを追加すると201が返り_内容の前後の空白は取り除かれる() throws Exception {
		when(cardService.createCard(1L, "買い物", Priority.HIGH))
				.thenReturn(new CardResponse(10L, "買い物", Priority.HIGH, 0));

		mockMvc.perform(post("/api/cards").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":1,\"content\":\"  買い物 \\n\",\"priority\":\"HIGH\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(10))
				.andExpect(jsonPath("$.content").value("買い物"));
	}

	@Test
	void 内容が空白だけなら400と_入力してくださいのメッセージが返る() throws Exception {
		mockMvc.perform(post("/api/cards").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":1,\"content\":\"　 \"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("カードの内容を入力してください"));
		verify(cardService, never()).createCard(anyLong(), any(), any());
	}

	@Test
	void 内容が1001文字なら400と_文字数のメッセージが返る() throws Exception {
		mockMvc.perform(post("/api/cards").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":1,\"content\":\"" + "あ".repeat(1001) + "\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("カードの内容は1000文字以内で入力してください"));
		verify(cardService, never()).createCard(anyLong(), any(), any());
	}

	@Test
	void 内容が1000文字ちょうどなら更新できる() throws Exception {
		String content = "あ".repeat(1000);
		when(cardService.updateCard(1L, content, null)).thenReturn(new CardResponse(1L, content, Priority.MEDIUM, 0));

		mockMvc.perform(patch("/api/cards/1").contentType(MediaType.APPLICATION_JSON)
				.content("{\"content\":\"" + content + "\"}"))
				.andExpect(status().isOk());
		verify(cardService).updateCard(1L, content, null);
	}

	@Test
	void 決まっていない重要度なら400と_重要度の説明が返る() throws Exception {
		mockMvc.perform(post("/api/cards").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":1,\"content\":\"買い物\",\"priority\":\"URGENT\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("重要度は HIGH・MEDIUM・LOW のどれかで指定してください"));
	}

	@Test
	void 移動先の位置がマイナスなら400が返る() throws Exception {
		mockMvc.perform(patch("/api/cards/1/move").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":1,\"position\":-1}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("移動先の位置は0以上で指定してください"));
		verify(cardService, never()).moveCard(anyLong(), anyLong(), anyInt());
	}

	@Test
	void カードを動かすと204が返る() throws Exception {
		mockMvc.perform(patch("/api/cards/3/move").contentType(MediaType.APPLICATION_JSON)
				.content("{\"listId\":2,\"position\":0}"))
				.andExpect(status().isNoContent());
		verify(cardService).moveCard(3L, 2L, 0);
	}

	@Test
	void ないカードを削除すると404と_見つからないメッセージが返る() throws Exception {
		doThrow(new NotFoundException("カードが見つかりません: 99")).when(cardService).deleteCard(eq(99L));

		mockMvc.perform(delete("/api/cards/99"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("カードが見つかりません: 99"));
	}

	@Test
	void URLの番号が数字でなければ400が返る() throws Exception {
		mockMvc.perform(delete("/api/cards/abc"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("URL の番号の形が正しくありません（数字で指定してください）"));
	}

	@Test
	void JSONでないデータを送ると415が返る() throws Exception {
		mockMvc.perform(post("/api/cards").contentType(MediaType.TEXT_PLAIN).content("買い物"))
				.andExpect(status().isUnsupportedMediaType())
				.andExpect(jsonPath("$.message").value("データは JSON（Content-Type: application/json）で送ってください"));
	}
}
