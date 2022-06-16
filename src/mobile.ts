import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as utils from './funtion';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const crashPath = DUC.get('ndkPath', "") +".app";

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

export async function crashCehck(context: vscode.ExtensionContext) {
	if(crashPath === ""){
		vscode.window.showErrorMessage("NDK가 존재하지 않습니다. 설정을 확인해주세요.");
		return;
	}
	const soFile = await vscode.window.showOpenDialog({
		filters: {
			'All files (*.*)': ['*']
		},
		openLabel: 'Select so File',
	});
	if (!soFile || soFile.length < 1) {
		return;
	}
	let errorCode = await vscode.window.showInputBox({
		placeHolder: "Error Code",
		prompt: "Error Code",
	});
	let terminal = vscode.window.createTerminal({
		name: "Resource Upload",
		hideFromUser: false
	});
	terminal.show();
	terminal.sendText("bash " + context.extensionPath + "/script/CrashCheck.sh " + crashPath + " " + soFile[0].fsPath + " " + errorCode)
}


