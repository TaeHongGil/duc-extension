import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as utils from './funtion';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const crashPath = DUC.get('ndkPath', "") +".app";

export async function serverStop() {
	let terminal = vscode.window.createTerminal({
		name: "Tomcat Force Stop",
		hideFromUser: false,
	});
	terminal.show();
	terminal.sendText("RESULT=$(lsof -i :8080 | awk 'NR==2 {print $2}')");
	terminal.sendText("kill $RESULT");
}
export async function bydSimulerror(context: vscode.ExtensionContext) {
	let terminal = vscode.window.createTerminal({
		name: "Simul error Check",
		hideFromUser: false
	});
	terminal.show();
	terminal.sendText("bash " + context.extensionPath + "/script/BydSimulError.sh");
}
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
		const regExp = /[0-9]/;
		if (!regExp.test(slotNum)) {
			vscode.window.showErrorMessage("다시 입력해주세요");
			return;
		}	
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

export async function thumbnailUpload(context: vscode.ExtensionContext): Promise<void> {
	// vscode.window.showErrorMessage(context.extensionPath);
	const resourceImage = await vscode.window.showOpenDialog({
		filters: {
			'png (*.png)': ['*']
		},
		canSelectFolders: false,
		canSelectFiles: true,
		canSelectMany: false,
		openLabel: 'Select Resource Folder',
	});
	if (!resourceImage || resourceImage.length < 1 || resourceImage[0].fsPath.indexOf(".png") < 0) {
		vscode.window.showErrorMessage("png 파일만 가능합니다.");
		return;
	}
	let slotNumber = await vscode.window.showInputBox({
		placeHolder: "Slot number",
		prompt: "Slot number",
	});
	const regExp = /[0-9]/;
    if (!regExp.test(slotNumber)) {
        vscode.window.showErrorMessage("다시 입력해주세요");
        return;
    }
	const version = await vscode.window.showQuickPick(['Thumbnail', 'Long Banner'], { placeHolder: 'Select Image' });
	let serverPath = "";
	let serverFileName = "";
	if(version === "Thumbnail"){
		serverPath = "/vol/wcasino/html/mobile/download/slot_thumbnail";
		serverFileName = slotNumber + ".png";
	}
	else if(version === "Long Banner"){
		serverPath = "/vol/wcasino/html/mobile/images/long";
		serverFileName = "long_banner_" + slotNumber + ".png";
	}
	else{
		vscode.window.showErrorMessage("다시 입력해주세요.");
		return;
	}
	let _path = resourceImage[0].fsPath.split('/');
	const name = _path[_path.length - 1];
	const path = resourceImage[0].fsPath.replace(name,"");
	if (name.length > 0 && path.length > 0 && version.length > 0 && slotNumber.length > 0) {
		let terminal = vscode.window.createTerminal({
			name: "Image Upload",
			hideFromUser: false
		});
		terminal.show();
		terminal.sendText("bash " + context.extensionPath + "/script/ThumbnailUpload.sh " + path + " " + name + " " + serverFileName + " " + serverPath + " ")
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


