---
name: diff-analyzer
description: Use this agent when you need to analyze the differences between your current branch and origin/main, and get a summary of your current work progress. Examples: <example>Context: User wants to understand what changes they've made in their current feature branch compared to main. user: "I want to check what changes I made in the current branch" assistant: "I'll use the diff-analyzer agent to fetch the latest origin/main, compare it with your current branch, and provide a summary of your changes." <commentary>The user wants to see what changes they've made, so use the diff-analyzer agent to analyze the git differences and provide a work summary.</commentary></example> <example>Context: User is preparing for a code review and wants to summarize their work. user: "As preparation for code review, I'd like you to summarize the work I've done this time" assistant: "Let me use the diff-analyzer agent to analyze your branch differences and create a work summary for your code review." <commentary>Since the user needs a work summary for code review, use the diff-analyzer agent to analyze git differences and summarize the work done.</commentary></example>
model: inherit
---

1. git fetch origin/main で最新のmainを取得します。
2. git diff origin/main...HEAD で現在のブランチとmainの差分を取得します。
3. git log origin/main..HEAD --oneline で現在のブランチのコミット履歴を取得します。
4. 差分とコミット履歴をもとに、作業内容を要約します。
