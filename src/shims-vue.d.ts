import type { AxiosStatic } from "axios";
import type { LoDashStatic } from "lodash";
import type { Store } from "vuex";
import type { ElMessage, ElMessageBox } from "element-plus";

declare module "vue" {
	interface ComponentCustomProperties {
		axios: AxiosStatic;
		$axios: AxiosStatic;
		_: LoDashStatic;
		$store: Store<unknown>;
		$message: typeof ElMessage;
		$confirm: typeof ElMessageBox.confirm;
		$alert: typeof ElMessageBox.alert;
		$prompt: typeof ElMessageBox.prompt;
	}
}
