// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileSystemProvider, Entry } from './fileExplorer';
import * as util from './util';
import * as maven from './maven';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
	const treeDataProvider = new FileSystemProvider(context);
	vscode.window.registerTreeDataProvider('nodeDependencies', treeDataProvider);
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => openResource(resource));
	vscode.commands.registerCommand('fileExplorer.refreshFile', () => treeDataProvider.refresh());
	vscode.commands.registerCommand('fileExplorer.updateAllForDuc', () => treeDataProvider.updateAllForDuc());
	vscode.commands.registerCommand('fileExplorer.update', (node: Entry) => treeDataProvider.update(node));
	vscode.commands.registerCommand('fileExplorer.deploy', (node: Entry) => treeDataProvider.deploy(node));
	vscode.commands.registerCommand('fileExplorer.gradleTask', (node: Entry) => treeDataProvider.gradleTask(node));
	vscode.commands.registerCommand('fileExplorer.webpack', (node: Entry) => treeDataProvider.webpack(node));
	vscode.commands.registerCommand('fileExplorer.install', (node: Entry) => treeDataProvider.install(node));
	vscode.commands.registerCommand('fileExplorer.createSimul', (node: Entry) => maven.createSimul());
	vscode.commands.registerCommand('fileExplorer.createUi', (node: Entry) => maven.createUi());
	vscode.commands.registerCommand('fileExplorer.resourceUpload', (node: Entry) => util.resourceUpload(context));
	vscode.commands.registerCommand('fileExplorer.thumbnailUpload', (node: Entry) => util.thumbnailUpload(context));

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
	let settingConfiguration = vscode.commands.registerCommand('duc.settingConfiguration', async () => util.settingConfiguration(context));
	let errorCheck = vscode.commands.registerCommand('byd.errorCheck', async () => util.bydSimulerror(context));

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
	context.subscriptions.push(errorCheck);
	context.subscriptions.push(settingConfiguration);
}

function openResource(resource: vscode.Uri): void {
	vscode.window.showTextDocument(resource);
}

export function deactivate() { }
