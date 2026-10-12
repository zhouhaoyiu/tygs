<template>
	<el-form class="record-form" label-position="top" :model="draft" @submit.prevent="submit">
		<div class="record-fields">
			<el-form-item
				v-for="field in schema.fields"
				:key="field.key"
				:label="field.label"
				:required="field.required"
				:class="{ 'record-wide': field.type === 'textarea' }"
			>
				<el-select
					v-if="field.options?.length"
					v-model="draft[field.key]"
					:aria-label="field.label"
					filterable
					allow-create
					default-first-option
					clearable
					:disabled="busy"
				>
					<el-option
						v-for="value in options(field)"
						:key="value"
						:label="value"
						:value="value"
					/>
				</el-select>
				<el-input
					v-else
					v-model="draft[field.key]"
					:aria-label="field.label"
					:type="field.type === 'textarea' ? 'textarea' : 'text'"
					:rows="3"
					:disabled="busy"
					maxlength="20000"
				/>
			</el-form-item>
		</div>
		<p v-if="validation || error" role="alert" class="record-error">
			{{ validation || error }}
		</p>
		<div class="record-form-actions">
			<el-button type="primary" icon="Check" native-type="submit" :loading="busy"
				>保存</el-button
			>
			<el-button icon="RefreshLeft" :disabled="busy" @click="reset">重置</el-button>
		</div>
	</el-form>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { blankValues, type ModuleSchema, type ModuleField } from "@/lib/workspace";
const props = defineProps<{
	schema: ModuleSchema;
	initial?: Record<string, string>;
	busy: boolean;
	error: string;
}>();
const emit = defineEmits<{ save: [Record<string, string>] }>();
const draft = ref<Record<string, string>>({}),
	validation = ref("");
function reset() {
	draft.value = { ...blankValues(props.schema), ...props.initial };
	validation.value = "";
}
function options(field: ModuleField) {
	return [...new Set([...(field.options || []), draft.value[field.key]].filter(Boolean))];
}
function submit() {
	if (props.busy) return;
	const missing = props.schema.fields.find((f) => f.required && !draft.value[f.key]?.trim());
	validation.value = missing ? `请填写${missing.label}` : "";
	if (!missing) emit("save", { ...draft.value });
}
watch(() => [props.schema, props.initial], reset, { immediate: true });
</script>
<style scoped>
.record-fields {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0 20px;
}
.record-fields :deep(.el-form-item__label) {
	line-height: 22px;
	height: auto;
}
.record-wide {
	grid-column: 1/-1;
}
.record-form-actions {
	display: flex;
	gap: 12px;
	margin: 16px 0;
}
.record-form-actions .el-button {
	margin: 0;
}
.record-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.record-form :deep(.el-select) {
	width: 100%;
}
@media (max-width: 600px) {
	.record-fields {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
