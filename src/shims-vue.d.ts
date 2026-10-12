import type { AxiosStatic } from "axios";
import type { Store } from "vuex";
import type { ElMessage, ElMessageBox } from "element-plus";

declare module "vue" {
	interface ComponentCustomProperties {
		axios: AxiosStatic;
		$axios: AxiosStatic;
		$store: Store<unknown>;
		$message: typeof ElMessage;
		$confirm: typeof ElMessageBox.confirm;
		$alert: typeof ElMessageBox.alert;
		$prompt: typeof ElMessageBox.prompt;
	}
}
