
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");
const regExpSimul = /duc\-simulation\-slot\-[0-9]/;
const regExpUi = /duc\-ui\-slot\-[0-9]/;

export function settingCheck() {
	if(jvmPath == ''){
		vscode.window.showErrorMessage("JVM 8 경로를 찾을 수 없습니다.");
		return true;
	}
	if(gradlePath == ''){
		vscode.window.showErrorMessage("Gradle 2.14 경로를 찾을 수 없습니다.");
		return true;
	}
	return false;
}
