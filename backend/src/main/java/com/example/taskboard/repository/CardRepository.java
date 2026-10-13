package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.taskboard.entity.Card;

// cards テーブルを読み書きする窓口（中身は Spring Data JPA が自動で作る）
public interface CardRepository extends JpaRepository<Card, Long> {

	// 指定したリストのカードを並び順（position の小さい順）で取得する
	List<Card> findByListIdOrderByPositionAsc(Long listId);

	// 指定したリストの中で、いちばん大きい position を調べる（カードが1枚もないときは -1）
	@Query("select coalesce(max(c.position), -1) from Card c where c.list.id = :listId")
	int findMaxPositionByListId(@Param("listId") Long listId);
}
