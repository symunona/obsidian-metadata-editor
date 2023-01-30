import { ItemView, WorkspaceLeaf } from "obsidian";

import { getAPI } from "main";

export const META_DATA_VIEW_TYPE = "meta-data-type";

export class MetaDataViewTable extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getIcon() {
		return "file-spreadsheet";
	}

	getViewType() {
		return META_DATA_VIEW_TYPE;
	}

	getDisplayText() {
		return "Meta Dataview";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
    container.empty();
    const header = container.createDiv()
    const api = getAPI(this.app)
		if (api) {
      api.folderMeta
      header.createEl("h4", { text: "Meta Dataview Index" });
    } else {
      header.createEl("h4", { text: "Loading Meta Index" });
    }

    // const search = 
    container.createEl("input", {
        value: "",
        cls: "full-width",
        placeholder: "filter",
      });

    // container.createEl("input", {
      //   value: "I am an input",
      //   placeholder: "anything, really",
      // });
		// Here
	}

	async onClose() {
		// Nothing to clean up.
	}
}
