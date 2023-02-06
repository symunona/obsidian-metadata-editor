import { ItemView, WorkspaceLeaf } from "obsidian";

import { getAPI } from "main";

import { getAPI as getDataViewApi } from "obsidian-dataview";
import { createTreeFromFileMap, renderTree } from "utils";

export const META_DATA_VIEW_TYPE = "meta-data-type";

// const MAX_LIST = 10;

export class MetaDataViewTable extends ItemView {
	dataViewApi = getDataViewApi();

	api;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.api = getAPI(this.app);
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
		const header = container.createDiv();
		const error = container.createDiv();
		const results = container.createDiv();
		if (this.api) {
			this.api.folderMeta;
			header.createEl("h4", { text: "Meta Dataview Index" });
		} else {
			header.createEl("h4", { text: "Loading Meta Index" });
		}

		const search = header.createEl("input", {
			value: "",
			cls: "full-width filter",
			placeholder: "dataview style filter e.g. metakey = test",
		});

		search.addEventListener("change", async (ev) => {
			console.log("change", search.value);
			error.createSpan("Loading...");
			if (!this.dataViewApi) {
				return;
			}

      const userQuery = search.value.toLowerCase().trim()

      // Smart WHERE.
      let query = ''
      if (userQuery.startsWith('from') ||
        userQuery.startsWith('where') ||
        userQuery.startsWith('group by') ||
        userQuery.startsWith('limit') ||
        userQuery.startsWith('flatten')){
        query = "table file " + search.value
      } else {
        // Assume the where
        query = "table file where " + search.value
      }

			const data = await this.dataViewApi.query(query);

			error.empty();
			results.empty();

			if (data.successful) {
				results.createEl("i", {
					text: `Found ${data.value.values.length} files`,
				});

				const resultListEl = results.createEl("div", {cls: 'nav-files-container'});

        const foundFileNames = data.value.values
					.map((item) => {
						return item[0].path;
					});

        renderTree(resultListEl, createTreeFromFileMap(foundFileNames))

				const foundFiles = data.value.values.map((item) => {
					return item[1];
				});
				const metaPropertiesOfList =
					this.api.folderMeta.createMetaIndex(
						foundFiles,
						this.dataViewApi.index
					);

				const metaAttrContainer = results.createEl("ul", {
					cls: "bordered-container",
				});
				Object.keys(metaPropertiesOfList).map((attrKey) => {
					const metaAttrItemEl = metaAttrContainer.createEl("li");
					metaAttrItemEl.createSpan({ text: attrKey });
					metaAttrItemEl.createEl("i", {
						cls: "faded-value-list",
						text: metaPropertiesOfList[attrKey].join(", "),
					});
				});
			} else {
				error.createEl("p", { text: "Query Error:" });
				error.createEl("pre", { text: data.error });
			}
		});
	}

	async onClose() {
		// Nothing to clean up.
	}
}
