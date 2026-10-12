export function repairDateOptions() {
	return {
		disabledDate: (date: Date) => date.getTime() > Date.now(),
		shortcuts: [
			{ text: "今天", value: () => new Date() },
			{ text: "昨天", value: () => new Date(Date.now() - 86400000) },
			{ text: "一周前", value: () => new Date(Date.now() - 7 * 86400000) },
		],
	};
}
