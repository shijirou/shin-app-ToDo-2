package com.example.taskboard.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.CardResponse;
import com.example.taskboard.entity.Card;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.exception.NotFoundException;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

// カードに関する処理をまとめるクラス
@Service
public class CardService {

	private final CardRepository cardRepository;
	private final TaskListRepository taskListRepository;

	public CardService(CardRepository cardRepository, TaskListRepository taskListRepository) {
		this.cardRepository = cardRepository;
		this.taskListRepository = taskListRepository;
	}

	// カードを追加する（指定したリストのいちばん下に入れる）
	@Transactional
	public CardResponse createCard(Long listId, String content) {
		TaskList list = taskListRepository.findById(listId)
				.orElseThrow(() -> new NotFoundException("リストが見つかりません: " + listId));
		int position = cardRepository.findMaxPositionByListId(listId) + 1;
		Card card = cardRepository.save(new Card(list, content, position));
		return CardResponse.from(card);
	}

	// カードの内容を変える
	@Transactional
	public CardResponse updateCard(Long id, String content) {
		Card card = findCard(id);
		card.updateContent(content);
		return CardResponse.from(card);
	}

	// カードを削除する
	@Transactional
	public void deleteCard(Long id) {
		cardRepository.delete(findCard(id));
	}

	// 番号でカードを探す。なければ「見つからない」エラー（404）にする
	private Card findCard(Long id) {
		return cardRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("カードが見つかりません: " + id));
	}
}
