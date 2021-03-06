// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileSystemProvider, Entry } from './fileExplorer';
import * as fnc from './funtion';
import * as util from './util';
import * as maven from './maven';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
	const treeDataProvider = new FileSystemProvider();
	vscode.window.registerTreeDataProvider('nodeDependencies', treeDataProvider);
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => openResource(resource));
	vscode.commands.registerCommand('fileExplorer.refreshFile', () => treeDataProvider.refresh());
	vscode.commands.registerCommand('fileExplorer.updateAllForDuc', () => treeDataProvider.updateAllForDuc());
	vscode.commands.registerCommand('fileExplorer.update', (node: Entry) => treeDataProvider.update(node));
	vscode.commands.registerCommand('fileExplorer.deploy', (node: Entry) => treeDataProvider.deploy(node));
	vscode.commands.registerCommand('fileExplorer.gradleTask', (node: Entry) => treeDataProvider.gradleTask(node));
	vscode.commands.registerCommand('fileExplorer.webpack', (node: Entry) => treeDataProvider.webpack(node));
	vscode.commands.registerCommand('fileExplorer.install', (node: Entry) => treeDataProvider.install(node));

	let resourceUpload = vscode.commands.registerCommand('duc.resourceUpload', async () => util.resourceUpload(context));
	let thumUpload = vscode.commands.registerCommand('duc.thumbnailUpload', async () => util.thumbnailUpload(context));
	let crashCehck = vscode.commands.registerCommand('duc.crashCheck', async () => util.crashCehck(context));
	let serverStop = vscode.commands.registerCommand('duc.serverstop', async () => util.serverStop());
	let createSimul = vscode.commands.registerCommand('duc.createSimul', async () => maven.createSimul());
	let createUi = vscode.commands.registerCommand('duc.createUi', async () => maven.createUi());
	let refresh = vscode.commands.registerCommand('duc.refresh', async () => maven.refresh());
	let deploy = vscode.commands.registerCommand('duc.deploy', async () => maven.deploy());
	let webpack = vscode.commands.registerCommand('duc.webpack', async () => maven.webpack());
	let gradleTask = vscode.commands.registerCommand('duc.gradleTask', async () => maven.gradleTask());
	
	context.subscriptions.push(crashCehck);
	context.subscriptions.push(resourceUpload);
	context.subscriptions.push(thumUpload);
	context.subscriptions.push(serverStop);
	context.subscriptions.push(createSimul);
	context.subscriptions.push(createUi);
	context.subscriptions.push(refresh);
	context.subscriptions.push(deploy);
	context.subscriptions.push(webpack);
	context.subscriptions.push(gradleTask);
}

function openResource(resource: vscode.Uri): void {
	vscode.window.showTextDocument(resource);
}

// this method is called when your extension is deactivated
export function deactivate() { }


	// let install = vscode.commands.registerTextEditorCommand('duc.install', async () => {
	// 	// let str = vscode.workspace.workspaceFolders[0].uri.path;
	// 	let slotNum = "";
	// 	const textBox = await vscode.window.showInputBox({
	// 		placeHolder: "Slot number",
	// 		prompt: "Slot number",
	// 		value: slotNum
	// 	  });
	// 	if(slotNum === ""){
	// 		vscode.window.showErrorMessage("?????? ??????????????? ???????????? ????????????.");
	// 		return ;
	// 	}
	// 	if(fnc.settingCheck()){
	// 		return ;
	// 	}
	// 	if(vscode.window.activeTextEditor){
	// 		str = vscode.window.activeTextEditor.document.uri.path;
	// 	}
	// 	strArray = str.split('/');
	// 	let index = 0;
	// 	let exist = false;
	// 	for (index = 0; index < strArray.length; index++) {
	// 		let isSimul = regExpSimul.test(strArray[index]);
	// 		let isUi = regExpUi.test(strArray[index]);
	// 		if(isSimul || isUi){
	// 			vscode.window.showInformationMessage(strArray[index] + " Maven Install");
	// 			exist = true;
	// 			break;
	// 		}
	// 	}
	// 	if(exist){
	// 		str = ""
	// 		for (let i = 0; i <= index; i++) {
	// 			str += strArray[i];
	// 			str += '/';
	// 		}
	// 		let terminal = vscode.window.createTerminal({
	// 			name: "Maven Install",
	// 			hideFromUser: false,
	// 		});
	// 		terminal.show();
	// 		terminal.sendText("cd " + str);
	// 		terminal.sendText("mvn install");
	// 	}
	// 	else{
	// 		vscode.window.showErrorMessage("?????? ?????? ??? Simulation ???????????? ????????? ???????????? ????????????.");
	// 	}
	// });
	// context.subscriptions.push(install);
