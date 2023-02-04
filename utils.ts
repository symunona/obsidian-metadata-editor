import { basename, dirname, sep } from "path";
import { extend } from "underscore";
import { getIcon } from "obsidian";

// @ts-ignore
window.getIcon = getIcon;

class Folder {
	constructor(name: string, parent?: Folder) {
		this.name = name;
		this.parent = parent;
	}
	name: string;
	parent: Folder | undefined;
	children: { [fileOrFolderName: string]: Folder | string } = {};
}

export function createTreeFromFileMap(fileList: Array<string>) {
	const map: {
		[id: string]: { [baesName: string]: string };
	} = {};

	// These are the folders that each file is in.
	fileList.forEach((item) => {
		const dir = dirname(item);
		if (!map[dir]) {
			map[dir] = {};
		}
		map[dir][basename(item)] = item;
	});

	let folderTree: Folder = new Folder("(root)");

	// Smart folder tree, where we have folders that only have one child grouped.
	// First, just build the tree, than snap it together.
	Object.keys(map).forEach((folderKey) => {
		const folders = folderKey.split(sep);
		let currentFolderRef = folderTree;
		folders.forEach((subFolder) => {
			currentFolderRef.children[subFolder] =
				currentFolderRef.children[subFolder] ||
				new Folder(subFolder, currentFolderRef);
			// @ts-ignore
			currentFolderRef = currentFolderRef.children[subFolder];
		});
		currentFolderRef.children = extend(
			currentFolderRef.children,
			map[folderKey]
		);
	});

	// Now snap together all the ones that only have one keys:
	// console.log('folderTee', folderTree)
	folderTree = snapTogetherSoloElements(folderTree, "");
	// console.log('SNAPPED', folderTree)
	return folderTree;
}

function snapTogetherSoloElements(
	folderTreeRoot: Folder,
	path: string
): Folder {
	const foldersWithinFolder = Object.keys(folderTreeRoot).filter(
		(child) => folderTreeRoot.children[child] instanceof Folder
	);
	const filesWithinFolderCount = Object.keys(folderTreeRoot).filter(
		(child) => folderTreeRoot.children[child] instanceof String
	).length;
	// Dd the snap
	if (foldersWithinFolder.length === 1 && filesWithinFolderCount === 0) {
		const subFolderName = Object.keys(folderTreeRoot)[0];

		const collapsed = snapTogetherSoloElements(
			// @ts-ignore due to we just filtered it up there.
			folderTreeRoot[subFolderName],
			(path += sep + folderTreeRoot)
		);

		folderTreeRoot.name += sep + subFolderName;
		folderTreeRoot.children = collapsed.children;
		return folderTreeRoot;
	} else {
		foldersWithinFolder.map((subFolderName) =>
			snapTogetherSoloElements(
				// @ts-ignore due to we just filtered it up there.
				folderTreeRoot[subFolderName],
				(path += sep + folderTreeRoot)
			)
		);
		return folderTreeRoot;
	}
}

export function renderTree(leaf: HTMLElement, tree: Folder) {
	const foldersWithinFolder = Object.keys(tree.children).filter(
		(child) => tree.children[child] instanceof Folder
	);
	const filesWithinFolder = Object.keys(tree.children).filter((child) => {
		return !(tree.children[child] instanceof Folder);
	});
	foldersWithinFolder.forEach((subFolderKey) => {
		// Add subfolder opener:
		const folderRootEl = leaf.createDiv({ cls: "nav-folder" });
		const title = folderRootEl.createDiv({ cls: "nav-folder-title" });
		const collapseArrow = title.createDiv({
			cls: "nav-folder-collapse-indicator collapse-icon",
		});
        // @ts-ignore
		collapseArrow.append(getIcon("chevron-down"));

        title.createDiv({
			cls: "nav-folder-title-content",
			text: subFolderKey,
		});
		const subFolderEl = folderRootEl.createDiv({
			cls: "nav-folder-children",
		});
		// @ts-ignore
		renderTree(subFolderEl, tree.children[subFolderKey]);
	});
	filesWithinFolder.forEach((fileName) => {
		const fileItemContainer = leaf.createDiv({ cls: "nav-file" });
        const title = fileItemContainer.createDiv({cls: 'nav-file-title'})
        title.createDiv({cls: 'nav-file-title-content', text: fileName})
        fileItemContainer.addEventListener('click', ()=>{
            const file = this.app.metadataCache.getFirstLinkpathDest(tree.children[fileName], "");
            const leaf = this.app.workspace.getUnpinnedLeaf();
            leaf.openFile(file, {active: true})
        })
	});
}
