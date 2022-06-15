import * as vscode from 'vscode';

export async function resourceUpload(context: vscode.ExtensionContext) {
		// vscode.window.showErrorMessage(context.extensionPath);
		const resourceFoler = await vscode.window.showOpenDialog({
			filters: {
				'All files (*.*)': ['*']
			},
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false,
			openLabel: 'Select Resource Folder',
		});
		if (!resourceFoler || resourceFoler.length < 1) {
			return;
		}
		let path = resourceFoler[0].fsPath.split('/');
		const forderName = path[path.length - 1];
		const forderPath = resourceFoler[0].fsPath;
		const version = await vscode.window.showQuickPick(['ver_1', 'ver_2'], { placeHolder: 'Select Version' });
		let slotNum = await vscode.window.showInputBox({
			placeHolder: "Slot number",
			prompt: "Slot number",
		});
		const slotNumber: number = Math.floor(+slotNum / 50) * 50 | 0;
		if (forderName.length > 0 && forderPath.length > 0 && version.length > 0 && slotNumber > 0) {
			let terminal = vscode.window.createTerminal({
				name: "Resource Upload",
				hideFromUser: false
			});
			terminal.show();
			terminal.sendText("bash " + context.extensionPath + "/script/ResourceUpload.sh " + forderName + " " + forderPath + " " + version + " " + slotNumber + " ")
		}
		else {
			vscode.window.showErrorMessage("다시 입력해주세요.");
		}
}