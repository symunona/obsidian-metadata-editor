import { basename, dirname, sep } from "path";
import { extend } from "underscore";

class Folder {
	[fileOrFolderName: string]: Folder | string;
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
	console.log("map", map);

	let folderTree: Folder = {};

	// Smart folder tree, where we have folders that only have one child grouped.
	// First, just build the tree, than snap it together.
	Object.keys(map).forEach((folderKey) => {
		const folders = folderKey
			.split(sep)
			.slice(0, folderKey.split(sep).length - 1);
		let currentFolderRef = folderTree;
		folders.forEach((subFolder) => {
			currentFolderRef[subFolder] =
				currentFolderRef[subFolder] || new Folder();
			// @ts-ignore
			currentFolderRef = currentFolderRef[subFolder];
		});
		currentFolderRef = extend(currentFolderRef, map[folderKey]);
	});
	console.log("tree:", folderTree);

	// Now snap together all the ones that only have one keys:
	folderTree = snapTogetherSoloElements(folderTree, "");
	console.warn("snapped tree", folderTree);
	return folderTree;
}

function snapTogetherSoloElements(
	folderTreeRoot: Folder,
	path: string
): Folder {
	const foldersWithinFolder = Object.keys(folderTreeRoot).filter(
		(child) => folderTreeRoot[child] instanceof Folder
	);
	const filesWithinFolderCount = Object.keys(folderTreeRoot).filter(
		(child) => folderTreeRoot[child] instanceof String
	).length;
	// Dd the snap
	if (foldersWithinFolder.length === 1 && filesWithinFolderCount === 0) {
		const subFolderName = Object.keys(folderTreeRoot)[0];

		return snapTogetherSoloElements(
			// @ts-ignore due to we just filtered it up there.
			folderTreeRoot[subFolderName],
			(path += sep + folderTreeRoot)
		);
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
	const foldersWithinFolder = Object.keys(tree).filter(
		(child) => tree[child] instanceof Folder
	);
	const filesWithinFolder = Object.keys(tree).filter(
		(child) => {
            return !(tree[child] instanceof Folder)
        }
	);
	foldersWithinFolder.forEach((subFolderKey) => {
		// Add subfolder opener:
		const folderRootEl = leaf.createDiv({ cls: "nav-folder" });
		folderRootEl.createDiv({ cls: "nav-folder-title", text: subFolderKey });
		const subFolderEl = folderRootEl.createDiv({
			cls: "nav-folder-children",
		});
		// @ts-ignore
		renderTree(subFolderEl, tree[subFolderKey]);
	});
	filesWithinFolder.forEach((fileName) => {
		leaf.createDiv({ cls: "nav-file", text: fileName });
        console.warn('fileName', fileName, tree[fileName])
	});
}
