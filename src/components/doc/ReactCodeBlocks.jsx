import { CopyBlock, dracula } from "react-code-blocks";

export default function ReactCodeBlocks({ code, language }) {
	return (
		<div>
			<CopyBlock
				language={language}
				text={code}
				showLineNumbers={true}
				theme={dracula}
				wrapLines={true}
				codeBlock
			/>
		</div>
	);
}
