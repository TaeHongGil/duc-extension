// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { FileSystemProvider, Entry } from './fileExplorer';
import * as utils from './funtion';
import * as fs from 'fs';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const Tomcat = workspace.getConfiguration("tomcat");
const tomcatServerName = DUC.get('serverName', "");
const tomcatPath = Tomcat.get("workspace");
const tomcatWorkspace = tomcatPath + "/" + tomcatServerName;
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");
const regExpSimul = /duc\-simulation\-slot\-[0-9]/;
const regExpUi = /duc\-ui\-slot\-[0-9]/;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
	const treeDataProvider = new FileSystemProvider();
	vscode.window.registerTreeDataProvider('nodeDependencies', treeDataProvider);
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => openResource(resource));
	vscode.commands.registerCommand('fileExplorer.refreshFile', () => treeDataProvider.refresh());
	vscode.commands.registerCommand('fileExplorer.updateAll', () => treeDataProvider.updateAll());
	vscode.commands.registerCommand('fileExplorer.update', (node: Entry) => treeDataProvider.update(node));
	vscode.commands.registerCommand('fileExplorer.deploy', (node: Entry) => treeDataProvider.deploy(node));
	vscode.commands.registerCommand('fileExplorer.gradleTask', (node: Entry) => treeDataProvider.gradleTask(node));
	vscode.commands.registerCommand('fileExplorer.webpack', (node: Entry) => treeDataProvider.webpack(node));
	vscode.commands.registerCommand('fileExplorer.install', (node: Entry) => treeDataProvider.install(node));

	let str = "";
	let strArray = new Array;
	let resourceUpload = vscode.commands.registerCommand('duc.resourceUpload', async () => {
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
	});
	context.subscriptions.push(resourceUpload);

	let serverStop = vscode.commands.registerCommand('duc.serverstop', async () => {
		let terminal = vscode.window.createTerminal({
			name: "Tomcat Force Stop",
			hideFromUser: false,
		});
		terminal.show();
		terminal.sendText("RESULT=$(lsof -i :8080 | awk 'NR==2 {print $2}')");
		terminal.sendText("kill $RESULT");
	});
	context.subscriptions.push(serverStop);

	let refresh = vscode.commands.registerCommand('duc.refresh', async () => {
		let slotNum = await vscode.window.showInputBox({
			placeHolder: "Slot number",
			prompt: "Slot number",
		});
		if (slotNum === "") {
			vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
			return;
		}
		if (utils.settingCheck()) {
			return;
		}
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-simulation-slot-" + slotNum;
		}
		if (fs.existsSync(str)) {
			let terminal = vscode.window.createTerminal({
				name: "Simulation Refresh",
				hideFromUser: false,
			});
			terminal.show();
			terminal.sendText("export GRADLE_HOME=" + gradlePath);
			terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
			terminal.sendText("export JAVA_HOME=" + jvmPath);
			terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
			terminal.sendText("cd " + str);
			if (fs.existsSync(tomcatWorkspace)) {
				terminal.sendText("mvn install");
				terminal.sendText("cp " + str + "/target/*-SNAPSHOT.jar " + tomcatWorkspace + "/webapps/duc-simulation-web/WEB-INF/lib/");
			}
			else {
				vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
			}
		}
		else {
			vscode.window.showErrorMessage("해당 경로에 시뮬레이션 폴더가 없습니다.");
		}
	});
	context.subscriptions.push(refresh);

	let deploy = vscode.commands.registerCommand('duc.deploy', async () => {
		let slotNum = await vscode.window.showInputBox({
			placeHolder: "Slot number",
			prompt: "Slot number",
		});
		if (slotNum === "") {
			vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
			return;
		}
		if (utils.settingCheck()) {
			return;
		}
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-simulation-slot-" + slotNum;
		}
		if (fs.existsSync(str)) {
			let terminal = vscode.window.createTerminal({
				name: "Simulation Deploy",
				hideFromUser: false,
			});
			terminal.show();
			terminal.sendText("export GRADLE_HOME=" + gradlePath);
			terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
			terminal.sendText("export JAVA_HOME=" + jvmPath);
			terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
			terminal.sendText("cd " + str);
			terminal.sendText("mvn deploy");
		}
		else {
			vscode.window.showErrorMessage("해당 경로에 시뮬레이션 폴더가 없습니다.");
		}
	});
	context.subscriptions.push(deploy);

	let webpack = vscode.commands.registerCommand('duc.webpack', async () => {
		let slotNum = await vscode.window.showInputBox({
			placeHolder: "Slot number",
			prompt: "Slot number",
		});
		if (slotNum === "") {
			vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
			return;
		}
		if (utils.settingCheck()) {
			return;
		}
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-ui-slot-" + slotNum;
		}
		if (fs.existsSync(str)) {
			let terminal = vscode.window.createTerminal({
				name: "UI Webpack",
				hideFromUser: false,
			});
			terminal.show();
			terminal.sendText("export GRADLE_HOME=" + gradlePath);
			terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
			terminal.sendText("export JAVA_HOME=" + jvmPath);
			terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
			terminal.sendText("cd " + str);
			terminal.sendText("mvn frontend:webpack");
			terminal.sendText("mvn antrun:run");
			if (fs.existsSync(tomcatWorkspace)) {
				if (workspace.workspaceFolders) {
					terminal.sendText("rsync -ruv --delete " + workspace.workspaceFolders[0].uri.fsPath + "/dug-cdn-web/src/main/webapp/ " + tomcatWorkspace + "/webapps/dug-cdn-web/");
				}
			}
			else {
				vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
			}
		}
		else {
			vscode.window.showErrorMessage("해당 경로에 UI 프로젝트 폴더가 없습니다.");
		}
	});
	context.subscriptions.push(webpack);

	let gradleTask = vscode.commands.registerCommand('duc.gradleTask', async () => {
		let slotNum = await vscode.window.showInputBox({
			placeHolder: "Slot number",
			prompt: "Slot number",
		});
		if (slotNum === "") {
			vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
			return;
		}
		if (utils.settingCheck()) {
			return;
		}
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-ui-slot-" + slotNum;
		}
		if (fs.existsSync(str)) {
			let terminal = vscode.window.createTerminal({
				name: "Gradle Task",
				hideFromUser: false,
			});
			terminal.show();
			terminal.sendText("export JAVA_HOME=" + jvmPath);
			terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
			terminal.sendText("cd " + str);
			terminal.sendText(gradlePath + "/bin/gradle deployCdnAnimateSlot");
			if (fs.existsSync(tomcatWorkspace)) {
				if (workspace.workspaceFolders) {
					terminal.sendText("rsync -ruv --delete " + workspace.workspaceFolders[0].uri.fsPath + "/dug-cdn-web/src/main/webapp/ " + tomcatWorkspace + "/webapps/dug-cdn-web/");
				}
			}
			else {
				vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
			}
		}
		else {
			vscode.window.showErrorMessage("해당 경로에 UI 프로젝트 폴더가 없습니다.");
		}
	});
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
	// 		vscode.window.showErrorMessage("해당 프로젝트가 존재하지 않습니다.");
	// 		return ;
	// 	}
	// 	if(utils.settingCheck()){
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
	// 		vscode.window.showErrorMessage("파일 경로 중 Simulation 프로젝트 폴더가 존재하지 않습니다.");
	// 	}
	// });
	// context.subscriptions.push(install);
