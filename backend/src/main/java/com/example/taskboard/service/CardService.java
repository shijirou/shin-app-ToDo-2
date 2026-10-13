package com.example.taskboard.service;

import java.util.ArrayList;
import java.util.List;

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

	// カードを並び替える・別のリストへ移す
	// 移動元と移動先のリストのカードを、並び順 0, 1, 2… に付け直す。
	// 途中で失敗したら @Transactional によって全部取り消される
	@Transactional
	public void moveCard(Long id, Long listId, int position) {
		Card card = findCard(id);
		TaskList targetList = taskListRepository.findById(listId)
				.orElseThrow(() -> new NotFoundException("リストが見つかりません: " + listId));
		Long sourceListId = card.getList().getId();

		// 1. 移動元のリストから、動かすカードを外して並び順を付け直す
		List<Card> sourceCards = new ArrayList<>(cardRepository.findByListIdOrderByPositionAsc(sourceListId));
		sourceCards.remove(card);
		if (!sourceListId.equals(listId)) {
			renumber(sourceCards);
		}

		// 2. 移動先のリストの、指定された位置に差し込む（同じリスト内なら、外した残りに差し込む）
		List<Card> targetCards = sourceListId.equals(listId)
				? sourceCards
				: new ArrayList<>(cardRepository.findByListIdOrderByPositionAsc(listId));
		int index = Math.min(position, targetCards.size()); // 最後より後ろを指定されたら、いちばん下に入れる
		targetCards.add(index, card);
		card.moveTo(targetList);
		renumber(targetCards);
	}

	// カードの並び順を、上から 0, 1, 2… に付け直す
	private void renumber(List<Card> cards) {
		for (int i = 0; i < cards.size(); i++) {
			cards.get(i).changePosition(i);
		}
	}

	// 番号でカードを探す。なければ「見つからない」エラー（404）にする
	private Card findCard(Long id) {
		return cardRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("カードが見つかりません: " + id));
	}
}
