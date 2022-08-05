<template>
	<div id="index">
		<a-descriptions title="Configs" />
		<a-form-model layout="inline" ref="form" :model="form" :rules="rules">
			<a-form-model-item label="Github Auth" prop="gitAuth">
				<a-input style="width: 250px" v-model="form.gitAuth" />
			</a-form-model-item>
			<a-form-model-item label="Keyword" prop="keyword">
				<a-input
          :disabled="!form.gitAuth.length"
					@change="() => $nextTick(() => throttleSearch())"
					placeholder="List will update if when you input"
					style="width: 250px"
					v-model="form.keyword"
				/>
			</a-form-model-item>
		</a-form-model>
		<a-table
			style="margin-top: 10px"
			:columns="columns"
			:data-source="list"
			row-key="id"
			:pagination="false"
			:loading="loading"
			bordered
			:scroll="{ x: '100%', y: '600px' }"
		>
			<template slot="name" slot-scope="text, record">
				<a :href="record?.html_url" target="_blank">
					<strong>{{ record?.name }}</strong>
				</a>
			</template>
			<template slot="createdAt" slot-scope="text, record">
				{{ record?.created_at }}
			</template>
			<template slot="owner" slot-scope="text, record">
				<a-avatar :src="record?.owner.avatar_url"></a-avatar>
				<a
					:href="record?.owner?.html_url"
					target="_blank"
					style="margin-left: 10px"
					>{{ record?.owner?.login }}</a
				>
			</template>
			<template slot="language" slot-scope="text, record"
				><a-tag color="blue">{{ record?.language }}</a-tag></template
			>
			<template slot="stars" slot-scope="text, record">
				<a-icon type="star" theme="twoTone" />
				<strong>{{ record?.stargazers_count }}</strong>
			</template>
		</a-table>
		<a-pagination
			style="margin-top: 10px"
			show-size-changer
			:page-size="pagination.pageSize"
			:current="pagination.pageNum"
			:total="pagination.total"
			@change="onChangePagination"
			@showSizeChange="onShowSizeChangePagination"
		/>
	</div>
</template>

<script>
import { Octokit } from "@octokit/core";
import { debounce } from "lodash";
export default {
	name: "IndexView",
	components: {},
	mounted() {},
	data() {
		return {
			form: {
				gitAuth: "",
				keyword: "",
			},
			loading: false,
			pagination: {
				pageSize: 30,
				pageNum: 1,
				total: 0,
			},
			rules: {
				gitAuth: [
					{
						required: true,
						message: "Please Input Your Github Auth",
						trigger: "change",
					},
				],
				keyword: [
					{
						required: true,
						message: "Please Input Keyword",
						trigger: "change",
					},
				],
			},
			list: [],
			columns: [
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
					width: 250,
					align: "center",
					scopedSlots: { customRender: "name" },
				},
				{
					title: "Created At",
					key: "createdAt",
					dataIndex: "createdAt",
					width: 180,
					align: "center",
					scopedSlots: { customRender: "createdAt" },
				},
				{
					title: "Owner",
					key: "owner",
					dataIndex: "owner",
					width: 150,
					align: "center",
					scopedSlots: { customRender: "owner" },
				},
				{
					title: "Language",
					key: "language",
					dataIndex: "language",
					width: 100,
					align: "center",
					scopedSlots: { customRender: "language" },
				},
				{
					title: "Stars",
					key: "stars",
					dataIndex: "stars",
					width: 100,
					align: "center",
					scopedSlots: { customRender: "stars" },
				},
			],
		};
	},
	methods: {
		throttleSearch: debounce(function () {
			this.pagination.pageNum = 1;
			this.$nextTick(() => {
				this.search();
			});
		}, 500),
		async search() {
			this.$refs.form.validate(async (valid) => {
				if (valid) {
					const octokit = new Octokit({
						auth: this.form.gitAuth,
					});
					try {
						this.loading = true;
						const response = await octokit.request("GET /search/repositories", {
							q: this.form.keyword,
							per_page: this.pagination.pageSize,
							page: this.pagination.pageNum,
						});
						this.loading = false;
						if (response.status >= 400) {
							throw new Error(response?.message);
						} else {
							this.pagination.total =
								this.pagination.total || response.data.total_count;
							this.list = response.data.items;
						}
					} catch (e) {
						this.loading = false;
						this.$message.error(e.toString());
					}
				}
			});
		},
		onChangePagination(pageNum) {
			this.pagination.pageNum = pageNum;
			this.$nextTick(() => {
				this.search();
			});
		},
		onShowSizeChangePagination(current, pageSize) {
			this.pagination.pageNum = 1;
			this.pagination.pageSize = pageSize;
			this.$nextTick(() => {
				this.search();
			});
		},
	},
};
</script>

<style lang="less">
#index {
	width: 100%;
	height: 100%;
	padding: 15px;
}
</style>
