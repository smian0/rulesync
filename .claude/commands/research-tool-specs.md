target_tool_name, tool_name_in_rulesync, remarks = $ARGUMENTS

target_tool_name: required
tool_name_in_rulesync: optional, default: target_tool_name
remarks: optional

If remarks is provided, please consider its content when performing the following tasks.

Please complete all of the following tasks.

Important: `.rulesync/*.md` files must include the required frontmatter. Refer to @README.md for frontmatter specification details.

rulesync-md-creator subagentを可能な限り並列で呼び出し、以下のファイルを作成してください。

- `.rulesync/specification-{tool_name_in_rulesync}-rules.md`
  - Research the specifications for rules or memories text files of target_tool_name.
- `.rulesync/specification-{tool_name_in_rulesync}-mcp.md`
  - Research the specifications for MCP configuration text files of target_tool_name.
- `.rulesync/specification-{tool_name_in_rulesync}-ignore.md`
  - Research the specifications for ignore text files of target_tool_name. Ignore files are configuration files used to specify files that should not be read or written by AI coding tools, such as files containing secret information.

いずれも可能な限り仕様を不足なく網羅的に調査・記述するよう、subagentに指示してください。

