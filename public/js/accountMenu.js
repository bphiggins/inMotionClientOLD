function addDelivery(id){
	Rho.Log.info("Start: addDelivery(" + id + ")", "inMotion");
	var taskObj = {};
	taskObj.modalTitle = "Edit Delivery";
	taskObj.transferNumber = 0;
	taskObj.localTransferNumber = 0;
	taskObj.transferType = "D";
	taskObj.status = "H";
	taskObj.accountId = id;
	taskObj.orderDate = getCurrentTimestampString();
	taskObj.transferDate = "0001-01-01 00:00:00.0";
	taskObj.orderBy = "";
	taskObj.department = "";
	taskObj.comment = "";
	taskObj.telephoneNumber = 0;
	taskObj.deliveryDate = "0001-01-01 00:00:00.0";
	taskObj.purchaseOrder = "";
	taskObj.postedByEmployeeId = $("#tripContainer").attr("data-currentEmployeeId");
	taskObj.deliveredByEmployeeId = 0;
	taskObj.transferredByEmployeeId = 0;
	taskObj.uhsPatientId = 0;
	taskObj.localUhsPatientId = 0;
	taskObj.cstat = "";
	taskObj.swapOutFlag = "";
	taskObj.swapOutNumber = 0;
	taskObj.localSwapOutNumber = 0;
	displayTaskModal(taskObj);
	Rho.Log.info("End: addDelivery", "inMotion");
}

function addFind(id){
	Rho.Log.info("Start: addFind(" + id + ")", "inMotion");

	//delete any existing tripDetail records with taskType = X
	var sqlExpression = [];
	sqlExpression[0] = id;

	var sql = "select accountId, ";
	sql += "employeeId, ";
	sql += "localTaskReferenceId, ";
	sql += "localTripDetailId, ";
	sql += "localTripId, ";
	sql += "scanLevel, ";
	sql += "taskReferenceId, ";
	sql += "taskType, ";
	sql += "tripDetailId, ";
	sql += "tripId, ";
	sql += "object ";
	sql += "from TripDetailTemporary ";
	sql += "where taskType = 'X' ";
	sql += "and accountId = ?";
	var tripDetailArray = userDatabase.executeSql(sql, sqlExpression);

	for (var i=0; i < tripDetailArray.length; i++){
		var tripDetailTemporaryInstance = tripDetailTemporaryModel.make({
			"accountId": tripDetailArray[i].accountId,
			"employeeId": tripDetailArray[i].employeeId,
			"localTaskReferenceId": tripDetailArray[i].localTaskReferenceId,
			"localTripDetailId": tripDetailArray[i].localTripDetailId,
			"localTripId": tripDetailArray[i].localTripId,
			"scanLevel": tripDetailArray[i].scanLevel,
			"taskReferenceId": tripDetailArray[i].taskReferenceId,
			"taskType": tripDetailArray[i].taskType,
			"tripDetailId": tripDetailArray[i].tripDetailId,
			"tripId": tripDetailArray[i].tripId,
			"object": tripDetailArray[i].object
		});

		tripDetailTemporaryInstance.destroy();
	}

	//check to see if findEquipment records exist for this account
	sqlExpression = [];
	sqlExpression[0] = id;

	sql = "SELECT accountId, ";
	sql += "cstat, ";
	sql += "description, ";
	sql += "prefix, ";
	sql += "unit, ";
	sql += "object ";
	sql += "from FindEquipment ";
	sql += "where accountId = ? ";
	var findEquipmentArray = userDatabase.executeSql(sql, sqlExpression);

	if (findEquipmentArray.length > 0){
		//check to see if a find task already exists
		sqlExpression = [];
		sqlExpression[0] = id;

		sql = "SELECT accountId, ";
		sql += "localTaskReferenceId, ";
		sql += "localTripDetailId, ";
		sql += "localTripId, ";
		sql += "taskReferenceId, ";
		sql += "taskType, ";
		sql += "tripDetailId, ";
		sql += "tripId, ";
		sql += "object ";
		sql += "from tripDetail ";
		sql += "where accountId = ? ";
		sql += "and taskType = 'F' ";
		tripDetailArray = userDatabase.executeSql(sql, sqlExpression);

		if (tripDetailArray.length === 0){
			var localTripId = $("#tripContainer").attr("data-localTripId");
			var tripId = $("#tripContainer").attr("data-tripId");
			var currentEmployeeId = $("#tripContainer").attr("data-currentEmployeeId");
			var currentTimestamp = getCurrentTimestampString();
			var tripDetailInstance = tripDetailModel.create({
				"accountId": id,
				"localTaskReferenceId": currentTimestamp.substr(0,4) + currentTimestamp.substr(5,2) + currentTimestamp.substr(8,2),
				"localTripDetailId": 0,
				"localTripId": localTripId,
				"taskReferenceId": 0,
				"taskType": "F",
				"tripDetailId": 0,
				"tripId": tripId,
				"employeeId": currentEmployeeId,
				"scanLevel": 0
			});

			tripDetailInstance.updateAttributes({
				"localTripDetailId": tripDetailInstance.get("object")
			});
			readTripDetail();
		}
		else {
			alert("A find task already exists for this account.");
		}
	}
	else {
		alert("There is no equipment that needs to be found.");
	}

	hideMenu();
	Rho.Log.info("End: addFind", "inMotion");
}

function addPickup(id){
	Rho.Log.info("Start: addPickup(" + id + ")", "inMotion");
	var taskObj = {};
	taskObj.modalTitle = "Edit Pickup";
	taskObj.transferNumber = 0;
	taskObj.localTransferNumber = 0;
	taskObj.transferType = "P";
	taskObj.status = "H";
	taskObj.accountId = id;
	taskObj.orderDate = getCurrentTimestampString();
	taskObj.transferDate = "0001-01-01 00:00:00.0";
	taskObj.orderBy = "";
	taskObj.department = "";
	taskObj.comment = "";
	taskObj.telephoneNumber = 0;
	taskObj.deliveryDate = "0001-01-01 00:00:00.0";
	taskObj.purchaseOrder = "";
	taskObj.postedByEmployeeId = $("#tripContainer").attr("data-currentEmployeeId");
	taskObj.deliveredByEmployeeId = 0;
	taskObj.transferredByEmployeeId = 0;
	taskObj.uhsPatientId = 0;
	taskObj.localUhsPatientId = 0;
	taskObj.cstat = "";
	taskObj.swapOutFlag = "";
	taskObj.swapOutNumber = 0;
	taskObj.localSwapOutNumber = 0;

	displayTaskModal(taskObj);
	Rho.Log.info("End: addPickup", "inMotion");
}

function displaySignatureValidationModal(params){
	Rho.Log.info("Start: displaySignatureValidationModal()", "inMotion");
	var localTransferNumber = params.data.localTransferNumber;
	var jsonObj = params.data.jsonObj;
	$.get("/public/templates/validationModal.html", function(data) {
		var template = Handlebars.compile(data);
		var templateWithData = template(jsonObj);

		if (jsonObj.captureSignature.errorList.length === 0){
			modal.open({
				content: templateWithData,
				fullScreen: true,
				enableScroll: true
			}, 
			function(){
				//TODO change source image
				var taskImage = $(".taskImage[data-localTaskReferenceId='" + localTransferNumber + "']");
				taskImage.attr("src", "images/uhs/checkbox-checked.png");
				taskImage.off("click");
				taskImage.on("click", {"localTransferNumber": localTransferNumber}, toggleSignatureCheck);
			});
		}
		else {
			modal.open({
				content: templateWithData,
				hideSave: true,
				fullScreen: true
			});
		}
		jsonObj = null;
	});

	Rho.Log.info("End: displaySignatureValidationModal", "inMotion");
}

function displayTaskModal(taskObj){
	Rho.Log.info("Start: displayTaskModal(" + JSON.stringify(taskObj) + ")", "inMotion");
	$.get("/public/templates/editTask.html", function(data){
		var template = Handlebars.compile(data);
		var templateWithData = template(taskObj);

		modal.open({
			content: templateWithData
		}, function(){
			var errMsgs = [];
			var telephoneNumber = $("#telephoneNumber").val();
			if(telephoneNumber.length === 0 || isNaN(telephoneNumber)){
				errMsgs.push( "Telephone is missing or not a valid number. \n" );
			}
			else if (telephoneNumber < 0 || telephoneNumber > 9999999999){
				errMsgs.push( "Telephone is not in the range 0 to 9999999999. \n" );
			}
			if (errMsgs.length !== 0) {
				alert('The following errors must be corrected before you can continue:\n\n' + errMsgs.join('\n'));
				return false;
			}
			else {
				saveTask();
			}
		});
		if (taskObj.transferType == 'P'){
			$('#swapOutFlag').attr("disabled", true);
		}
		taskObj = null;
	});
	Rho.Log.info("End: displayTaskModal", "inMotion");
}

function readFacilityDetail(id){
	Rho.Log.info("Start: readFacilityDetail(" + id + ")", "inMotion");
	var sqlExpression = [];
	sqlExpression[0] = id;

	var sql = "select accountId, ";
	sql += "accountName, ";
	sql += "addressLine1, ";
	sql += "addressLine2, ";
	sql += "city, ";
	sql += "state, ";
	sql += "zip, ";
	sql += "standingPurchaseOrder, ";
	sql += "districtId ";
	sql += "from Account ";
	sql += "where accountId = ?";
	var account = userDatabase.executeSql(sql, sqlExpression);
	var jsonObj = account[0];

	//populate template
	$.get("/public/templates/facilityDetail.html", function(data){
		var template = Handlebars.compile(data);
		var templateWithData = template(jsonObj);
		modal.open({
			content: templateWithData,
			hideSave: true
		});
		jsonObj = null;
	});
	Rho.Log.info("End: readFacilityDetail", "inMotion");
}

function removeAccount(id){
	Rho.Log.info("Start: removeAccount(" + id + ")", "inMotion");
	
	//TODO need to delete accessories if they have been created
	var msg = confirm("You are about to remove this account and all its related records from this trip. \n\n Continue?");
	if (msg === true){
		//need to wrap in Rho database api transaction with commit and rollback
		userDatabase.startTransaction();
		try	{
			var currentEmployeeId = $("#tripContainer").attr("data-currentEmployeeId");

			var sqlExpression = [];
			sqlExpression[0] = id;

			var sql = "select hasUnitAccessoryTracking ";
			sql += "from Account ";
			sql += "where accountId = ? ";
			var accountList = userDatabase.executeSql(sql, sqlExpression);

			var hasUnitAccessoryTracking = 0;
			for (var i=0; i < accountList.length; i++){
				hasUnitAccessoryTracking = accountList[i].hasUnitAccessoryTracking;
			}

			sqlExpression = [];
			sqlExpression[0] = id;
			sqlExpression[1] = id;

			//get data for account
			sql = "select accountId as accountId, ";
			sql += "taskReferenceId as taskReferenceId, ";
			sql += "localTaskReferenceId as localTaskReferenceId, ";
			sql += "taskType as taskType, ";
			sql += "tripDetailId as tripDetailId, ";
			sql += "localTripDetailId as localTripDetailId, ";
			sql += "tripId as tripId, ";
			sql += "localTripId as localTripId,";
			sql += "employeeId as employeeId, ";
			sql += "object as object ";
			sql += "from tripDetail td ";
			sql += "where accountId = ? ";
			sql += "union ";
			sql += "select accountId, ";
			sql += "taskReferenceId, ";
			sql += "localTaskReferenceId, ";
			sql += "taskType, ";
			sql += "tripDetailId, ";
			sql += "localTripDetailId, ";
			sql += "tripId, ";
			sql += "localTripId,";
			sql += "employeeId, ";
			sql += "object ";
			sql += "from tripDetailTemporary ";
			sql += "where accountId = ? ";
			var tripDetailList = userDatabase.executeSql(sql, sqlExpression);

			for (i = 0; i < tripDetailList.length; i++){
				//if transferHeader status is not C then
				//set transfer header back to held status
				sqlExpression = [];
				sqlExpression[0] = tripDetailList[i].localTaskReferenceId;

				sql = "select accountId, ";
				sql += "comment, ";
				sql += "cstat, ";
				sql += "deliveredByEmployeeId, ";
				sql += "deliveryDate, ";
				sql += "department, ";
				sql += "localSwapOutNumber, ";
				sql += "localTransferNumber, ";
				sql += "localUhsPatientId, ";
				sql += "orderBy, ";
				sql += "orderDate, ";
				sql += "purchaseOrder, ";
				sql += "status, ";
				sql += "swapOutFlag, ";
				sql += "swapOutNumber, ";
				sql += "telephoneNumber, ";
				sql += "transferDate, ";
				sql += "transferNumber, ";
				sql += "transferType, ";
				sql += "transferredByEmployeeId, ";
				sql += "uhsPatientId, ";
				sql += "object ";
				sql += "from transferHeader ";
				sql += "where localTransferNumber = ?";
				
				var transferHeaderArray = userDatabase.executeSql(sql, sqlExpression);

				if (transferHeaderArray.length > 0){
					if (transferHeaderArray[0].status != "C"){
						//Remove Refusals
						removeRefusalByTask(tripDetailList[i].localTaskReferenceId, currentEmployeeId);
							
						//Remove preferred accessories
						removePreferredAccessoryByTask(hasUnitAccessoryTracking, tripDetailList[i].localTaskReferenceId);
	
						//Remove damaged item detail records
						removeDamagedItemByTask(tripDetailList[i].localTaskReferenceId);
	
						//Remove swapouts
						removeSwapOutByTask(tripDetailList[i].localTaskReferenceId);
						
						//reset transfer header record
						resetTransferHeaderByTask(tripDetailList[i].localTaskReferenceId, currentEmployeeId);
							
						//remove transfer detail records
						removeTransferDetailByTask(tripDetailList[i].localTaskReferenceId);
							
						//remove trip detail record
						removeTripDetailByTask(tripDetailList[i].localTaskReferenceId);	
					}
				}
				if (tripDetailList[i].taskType == "X"){
					tripDetailInstance = tripDetailTemporaryModel.make({
						"accountId": tripDetailList[i].accountId,
						"taskReferenceId": tripDetailList[i].taskReferenceId,
						"localTaskReferenceId": tripDetailList[i].localTaskReferenceId,
						"taskType": tripDetailList[i].taskType,
						"tripDetailId": tripDetailList[i].tripDetailId,
						"localTripDetailId": tripDetailList[i].localTripDetailId,
						"tripId": tripDetailList[i].tripId,
						"localTripId": tripDetailList[i].localTripId,
						"employeeId": tripDetailList[i].employeeId,
						"object": tripDetailList[i].object
					});
					tripDetailInstance.destroy();
				}
				if (tripDetailList[i].taskType == "F"){
					tripDetailInstance = tripDetailModel.make({
						"accountId": tripDetailList[i].accountId,
						"taskReferenceId": tripDetailList[i].taskReferenceId,
						"localTaskReferenceId": tripDetailList[i].localTaskReferenceId,
						"taskType": tripDetailList[i].taskType,
						"tripDetailId": tripDetailList[i].tripDetailId,
						"localTripDetailId": tripDetailList[i].localTripDetailId,
						"tripId": tripDetailList[i].tripId,
						"localTripId": tripDetailList[i].localTripId,
						"employeeId": tripDetailList[i].employeeId,
						"object": tripDetailList[i].object
					});
					tripDetailInstance.destroy();
				}
			}
			userDatabase.commitTransaction();
			readTripDetail();
			$("#headerListContent").empty();
			$("#frameListContent").empty();
			hideMenu();
		}
		catch (e) {
			Rho.Log.info("Error: removeAccount(" + e.message + ") - rolled back", "inMotion");
			
			userDatabase.rollbackTransaction();
		}
		finally {
			Rho.Log.info("End: removeAccount", "inMotion");
			
		}
	}
}



function signatureCheck(id){
	Rho.Log.info("Start: signatureCheck(" + id + ")", "inMotion");
	hideMenu();
	if (Rho.RhoConnectClient.isSyncing()) {
		alert("Your device is currently synching. Please wait to capture the signature until synching is complete.");
	}
	else {
		var jsonObj = getValidateJsonObject("captureSignature");
		if (jsonObj.trip.tripCheckoutDateDevice == "0001-01-01 00:00:00.0"){
			alert("You must checkout your trip before capturing a signature");
		}
		else {
			progressBar.signatureId = id;
			detectUHSRhoServer(signatureCheckWithNetwork, signatureCheckNoNetworkWarning);
		}
	}
	Rho.Log.info("End: signatureCheck", "inMotion");
}

function signatureCheckWithNetwork(){
	Rho.Log.info("Start: signatureCheckWithNetwork()", "inMotion");
	var jsonObj = getValidateJsonObject("captureSignature");
	if (parseInt(jsonObj.trip.unsyncedRecordCount) > 0 || jsonObj.syncErrors.errorList.length > 0){
		progressBar.currentStep = 0;
		progressBar.loadingSteps = 2;
		progressBar.loadingModel = "";
		$.get("/public/templates/loading.html", signatureProgress);
	}
	else {
		var id = progressBar.signatureId;
		delete progressBar.signatureId;
		showSignature(id);
	}
	Rho.Log.info("End: signatureCheckWithNetwork", "inMotion");
}

function signatureCheckNoNetworkWarning(){
	Rho.Log.info("Start: signatureCheckNoNetworkWarning()", "inMotion");
	if (Rho.Network.hasWifiNetwork()) {
		alert("Unable to connect to UHS, please:\n1. Turn off Wi-Fi\n OR\n2. Accept the Terms & Conditions of the current wireless network.");
		enableScanner();
	}
	else {
		signatureCheckNoNetwork();
	}
	Rho.Log.info("End: signatureCheckNoNetworkWarning", "inMotion");
}

function signatureCheckNoNetwork(){
	Rho.Log.info("Start: signatureCheckNoNetwork()", "inMotion");
	alert("A network connection could not be found.  You may continue the signature capture process at your own risk.  Any issues with the equipment included on the affected transfers will be listed on the 'Trip Completion' report and will need to be resolved on inCommand.");
	var id = progressBar.signatureId;
	delete progressBar.signatureId;
	showSignature(id);
	Rho.Log.info("End: signatureCheckNoNetwork", "inMotion");
}

function signatureCheckServerErrors(errorCode){
	Rho.Log.info("Start: signatureCheckServerErrors(" + errorCode + ")", "inMotion");
	alert("An error occurred while verifying the data.  You may continue the signature capture process at your own risk.  Any issues with the equipment included on the affected transfers will be listed on the 'Trip Completion' report and will need to be resolved on inCommand.");
	var id = progressBar.signatureId;
	delete progressBar.signatureId;
	showSignature(id);
	Rho.Log.info("End: signatureCheckServerErrors", "inMotion");
}

function signatureProgress(loadingData) {
	Rho.Log.info("Start: signatureProgress()", "inMotion");
	modal.open({
		content: loadingData,
		hideSave: true,
		hideClose: true
	});

	$("#loadingMessage").replaceWith("<div id=\"loadingMessage\">Validating Data to inCommand</div>");
	updateProgress("Validating application data");
	signatureCheckUnits();
	Rho.Log.info("End: signatureProgress", "inMotion");
}

function signatureCheckUnits() {
	Rho.Log.info("Start: signatureCheckUnits()", "inMotion");
	try {
		var urlStr = Rho.RhoConnectClient.syncServer;
		urlStr += "/app/v1/Validate/capturesignature";
	
		var sql = "SELECT prefix, unit from transferDetail d ";
		sql += "left outer join transferHeader h on  d.localTransferNumber = h.localTransferNumber ";
		sql += "where h.accountId = ? and h.transferType = ?";
		var sqlExpression = [progressBar.signatureId, 'P'];
		var sqlArray = userDatabase.executeSql(sql, sqlExpression);
		if (sqlArray.length == 0) {
			Rho.Log.info("Running: signatureCheckUnits (no pickups)", "inMotion");
			updateProgress("Upload Complete - Capture Signature", 100);
			modal.close(false);
			onSignatureSyncComplete();
		}
		else {
			Rho.Log.info("Running: signatureCheckUnits (" + sqlArray.length + ")", "inMotion");
			var jsonObj = {};
			var items = [];
			var item = {};
			jsonObj.employeeId = getEmployeeId();

			for (var i = 0; i < sqlArray.length; i++){
				item = {};
				item["prefix"] = sqlArray[i].prefix;
				item["unit"] = sqlArray[i].unit;
				items.push(item);
			}
			jsonObj.items = items;
			Rho.Network.post(
					{
						"url" : urlStr,
						"body" : jsonObj,
						"headers" : {
							"Content-Type": "application/json",
							"Cookie": getRhoSession()
							}
					},
					onSignatureCheckUnits
			);
		}
	}
	catch (e) {
		Rho.Log.info("Error: signatureCheckUnits(" + e.message + ")", "inMotion");
		signatureCheckNoNetwork();
	}
	Rho.Log.info("End: signatureCheckUnits", "inMotion");
}

function onSignatureCheckUnits(params) {
	Rho.Log.info("Start: onSignatureCheckUnits(" + JSON.stringify(params) + ")", "inMotion");

	if (params.body.length > 0){
		try {
			var jsonObj = JSON.parse(params.body);
			if (jsonObj.isSuccessful){
				var isSuccessful = jsonObj.isSuccessful;
				if (isSuccessful == 1){
					if (jsonObj.capturesignature) {
						var units = jsonObj.capturesignature;
						if (units.length > 0) {
							try {
								var sql;
								var sqlExpression;
								var sqlArray;
								var recordId;
								var syncErrorInstance;
		
								for (var i = 0; i < units.length; i++) {
									if (units[i].errorText != "") {
										sql = "select distinct recordId from SyncError ";
										sql += "where recordId in ( ";
										sql += "select localTransferDetailId from TransferDetail where prefix = ? and unit = ? )";
		
										sqlExpression = [units[i].prefix.toUpperCase(), units[i].unit];
										sqlArray = userDatabase.executeSql(sql, sqlExpression);
		
										if (sqlArray.length == 0) {
											sql = "select localTransferDetailId from TransferDetail where prefix = ? and unit = ? ";
											sqlArray = userDatabase.executeSql(sql, sqlExpression);
		
											if (sqlArray.length == 0) {
												recordId = "999999";
											}
											else {
												recordId = sqlArray[0].localTransferDetailId;
											}
											syncErrorInstance = syncErrorModel.create({
												"errorCode": 8,
												"errorMessage": units[i].errorText,
												"errorType": "error",
												"recordId": recordId,
												"sourceId": "17",
												"sourceName": "TransferDetail"
											});
										}
									}
								}
							}
							catch (e) {
								Rho.Log.info("Error: onSignatureCheckUnits(" + e.message + ")", "inMotion");
							}
						}
						updateProgress("Upload Complete - Capture Signature", 100);
						modal.close(false);
						onSignatureSyncComplete();
					}
					else {
						var errCode = params.body ? params.body : "Unknown error";
						errCode += params.error_code ? (" (" + params.error_code + ")") : "";
						errCode += params.http_error ? (" [" + params.http_error + "]") : "";
						Rho.Log.info("Error: onSignatureCheckUnits(errorCode=" + errCode + ")", "inMotion");
						updateProgress("Upload Error - Capture Signature", 100);
						modal.close(false);
						signatureCheckServerErrors(errCode);
					}
				}
				else {
					var errCode = params.body ? params.body : "Unknown error";
					errCode += params.error_code ? (" (" + params.error_code + ")") : "";
					errCode += params.http_error ? (" [" + params.http_error + "]") : "";
					Rho.Log.info("Error: onSignatureCheckUnits(errorCode=" + errCode + ")", "inMotion");
					updateProgress("Upload Error - Capture Signature", 100);
					modal.close(false);
					signatureCheckServerErrors(errCode);
				}
			}
			else {
				var errCode = params.body ? params.body : "Unknown error";
				errCode += params.error_code ? (" (" + params.error_code + ")") : "";
				errCode += params.http_error ? (" [" + params.http_error + "]") : "";
				Rho.Log.info("Error: onSignatureCheckUnits(errorCode=" + errCode + ")", "inMotion");
				updateProgress("Upload Error - Capture Signature", 100);
				modal.close(false);
				signatureCheckServerErrors(errCode);
			}
		}
		catch (e2) {
			var errCode = params.body ? params.body : "Unknown error";
			errCode += params.error_code ? (" (" + params.error_code + ")") : "";
			errCode += params.http_error ? (" [" + params.http_error + "]") : "";
			Rho.Log.info("Error: onSignatureCheckUnits(errorCode=" + errCode + ")", "inMotion");
			updateProgress("Upload Error - Capture Signature", 100);
			modal.close(false);
			signatureCheckServerErrors(errCode);
		}
	}	
	else {
		Rho.Log.info("Error: onSignatureCheckUnits(errorCode=" + params.error_code + ")", "inMotion");
		updateProgress("Upload Complete - Capture Signature", 100);
		modal.close(false);
		signatureCheckNoNetwork();
	}
	Rho.Log.info("End: onSignatureCheckUnits", "inMotion");
}

function onSignatureSyncComplete() {
	Rho.Log.info("Start: onSignatureSyncComplete()", "inMotion");
	var id = progressBar.signatureId;
	delete progressBar.signatureId;
	showSignature(id);
	Rho.Log.info("End: onSignatureSyncComplete", "inMotion");
}

function showSignature(id){
	Rho.Log.info("Start: showSignature(" + id + ")", "inMotion");
	/*hide trip menu options. This handled in in showMenu()
		View Held Transfers, View All Accounts, Checkout, Close Trip, Edit Trip, Sync, Administration
	  hide account menu options. This is handled in showMenu()
		Add Delivery, Add Pickup, Add Find, Remove Account
	*/
	var localTransferNumber;
	var jsonObj;
	var allowContinue = true;
	var i;
	var sqlExpression = [];
	sqlExpression[0] = id;

	var sql = "select localTaskReferenceId, ";
	sql += "taskType ";
	sql += "from TripDetail ";
	sql += "where accountId = ? ";
	var tripDetailList = userDatabase.executeSql(sql, sqlExpression);

	for (i = 0; i < tripDetailList.length; i++){
		localTransferNumber = tripDetailList[i].localTaskReferenceId;
		jsonObj = getValidateJsonObject("captureSignature", localTransferNumber);
		$(".taskContainer[data-localTaskReferenceId='" + localTransferNumber + "']").each(function(){
			var taskImage = $(this).find(".taskImage");
			if (tripDetailList[i].taskType == "F"){
				//do nothing
			}
			else if (jsonObj.captureSignature.errorList.length > 0){
				logErrors(jsonObj, "capture signature");
				taskImage.attr("src", "images/uhs/signatureError.png");
				taskImage.off("click");
				taskImage.on("click", {"jsonObj": jsonObj, "localTransferNumber": localTransferNumber}, displaySignatureValidationModal);
			}
			else if (jsonObj.captureSignature.warningList.length > 0){
				taskImage.attr("src", "images/uhs/signatureWarning.png");
				taskImage.off("click");
				taskImage.on("click", {"jsonObj": jsonObj, "localTransferNumber": localTransferNumber}, displaySignatureValidationModal);
			}
			else {
				taskImage.attr("src", "images/uhs/checkbox-unchecked.png");
				taskImage.off("click");
				taskImage.on("click", {"localTransferNumber": localTransferNumber}, toggleSignatureCheck);
			}
			jsonObj = null;	//why nulled here?? - to release memory bph 10-18-2014
		});
	}
	if (allowContinue) {
		showSignatureContinue(id);
	}
	hideMenu();
}

function showSignatureContinue(id) {
	replaceMaxLength();	
	$(".taskTextContainer").off("click");
	$("#tripContainer").attr("data-applicationMode", "capture signature");
	$.get("/public/templates/signatureHeader.html", function(data){
		$("#headerListContent").replaceWith(data);
	});

	var sql = "SELECT ac.accountContactId, ";
	sql += "ac.accountId, ";
	sql += "ac.contactLastUsedDate, ";
	sql += "ac.contactType, ";
	sql += "ac.contactValue, ";
	sql += "ac.localAccountContactId ";
	sql += "from AccountContact ac ";
	sql += "where accountId = " + id + " ";
	sql += "order by contactLastUsedDate desc";
	var contactList = userDatabase.executeSql(sql);

	var emailList = [];
	var faxList = [];
	var contactObj;
	for (var i=0; i < contactList.length; i++){
		contactObj = {};
		contactObj.accountContactId = contactList[i].accountContactId;
		contactObj.accountId = contactList[i].accountId;
		contactObj.contactLastUsedDate = contactList[i].contactLastUsedDate;
		contactObj.contactType = contactList[i].contactType;
		contactObj.contactValue = contactList[i].contactValue;
		contactObj.localAccountContactId = contactList[i].localAccountContactId;

		if (contactList[i].contactType == "E"){
			emailList.push(contactObj);
		}
		else if (contactList[i].contactType == "F"){
			faxList.push(contactObj);
		}
		else {
			//uknown contact type do nothing
		}
	}

	var jsonObject = {};
	jsonObject.emailList = emailList;
	jsonObject.faxList = faxList;
	jsonObject.accountId = id;
	$.get("/public/templates/signature.html", function(data){
		var template = Handlebars.compile(data);
		$("#frameListContent").replaceWith(template(jsonObject));
		jsonObject = null;
		refreshFrameListScroll();

		$("#signatureCancel").off("click");
		$("#signatureCancel").on("click", function(){
			signatureCancel();
		});
		$("#signatureContinue").off("click");
		$("#signatureContinue").on("click", function(){
			signatureContinue();
		});
		$("#signatureSave").off("click");
		$("#signatureSave").on("click", function(){
			signatureSave();
		});
		$("#signatureDocumentation").off("click");
		$("#signatureDocumentation").on("click", function(){
			signatureDocumentation();
		});

		if (!Rho.System.isRhoSimulator){
			$("#clearInlineSignature").off("click");
			$("#clearInlineSignature").on("click", function(){
				clearInlineSignature();
			});
		}
		$("#selectEmailFaxForm").show();
		$(".emailContactImage").off("click");
		$(".emailContactImage").on("click", function(){
			var index = $(this).attr("data-index");
			toggleCheckbox("emailContactImage" + index);
		});
		$(".faxContactImage").off("click");
		$(".faxContactImage").on("click", function(){
			var index = $(this).attr("data-index");
			toggleRadioButton("faxContactImage" + index, "faxContactImage");
		});
		$("#captureSignatureForm").hide();
		$("#signatureSave").hide();
		$("#signatureDocumentation").hide();
		$("#clearInlineSignature").hide();
	});
	Rho.Log.info("End: showSignature", "inMotion");
}

function signatureCancel(){
	Rho.Log.info("Start: signatureCancel()", "inMotion");
	$("#tripContainer").attr("data-applicationMode", "");

	//remove onclick events from img[data-taskReferenceId]. handled by readTripDetail()
	readTripDetail();
	hideInlineSignature();

	/*unhide trip menu options. handled by showMenu()
		View Held Transfers, View All Accounts, Checkout, Close Trip, Edit Trip, Sync, Administration
	*/
	/*unhide account menu options. handled by showMenu()
		Add Delivery, Add Pickup, Add Find, Remove Account
	*/
	$("#headerListContent").empty();
	$("#frameListContent").empty();
	Rho.Log.info("End: signatureCancel", "inMotion");
}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function signatureContinue(){
	Rho.Log.info("Start: signatureContinue()", "inMotion");
	var errMsgs = [];
	if ($(".taskImage[src='images/uhs/checkbox-checked.png']").length < 1){
		errMsgs.push("You must select a task.\n" );
	}
	var emailInput = $("#emailInput").val();
	if (emailInput.length > 0) {
		if(emailInput.indexOf(" ") != -1){
			errMsgs.push("Email cannot contain spaces. Separate multiple emails with a comma. \n" );
		}
		var emailArray = emailInput.split(",");
		for (var i = 0; i < emailArray.length; i++){
			if(!isValidEmailAddress(emailArray[i])){
				errMsgs.push("Invalid email address entered: " + emailArray[i]);
			}
		}
	}
	var faxInput = $("#faxInput").val();
	if (faxInput.length > 0) {
		var regexFax = /\d{10}/;
		if(!faxInput.match(regexFax)){
	    	errMsgs.push("Invalid fax entered. Must contain 10 numeric characters. \n");
	    }
	}
	if (errMsgs.length !== 0) {
		alert('The following errors must be corrected before you can continue:\n\n' + errMsgs.join('\n'));
	}
	else {
		$("#selectEmailFaxForm").hide();
		$("#captureSignatureForm").show();
		$("#acceptTermCondition").off("click");
		$("#acceptTermCondition").on("click", function(){
			if($("#acceptTermCondition").attr("src") == "images/uhs/checkbox-unchecked.png"){
				$("#acceptTermCondition").attr("src", "images/uhs/checkbox-checked.png");
			}
			else{
				$("#acceptTermCondition").attr("src", "images/uhs/checkbox-unchecked.png");
			}
		});
		$("#signatureDocumentation").show();
		$("#signatureContinue").hide();
		$("#clearInlineSignature").show();
		$("#signatureSave").show();
		
		refreshFrameListScroll();
		setTimeout(showInlineSignature, 500);
	}
	Rho.Log.info("End: signatureContinue", "inMotion");
}

function signatureDocumentation(){
	Rho.Log.info("Start: signatureDocumentation()", "inMotion");
	//TODO still need to develop only skeleton code currently
	//TODO need to include accessories once it is defined
	var accountId = $("#captureSignatureForm").attr("data-accountId");
	var sqlExpression = [];
	sqlExpression[0] = accountId;

	var sql = "select a.accountId, ";
	sql += "a.accountName, ";
	sql += "addressLine1, ";
	sql += "addressLine2, ";
	sql += "city, ";
	sql += "districtId, ";
	sql += "employeeId, ";
	sql += "hasUnitAccessoryTracking, ";
	sql += "standingPurchaseOrder, ";
	sql += "state, ";
	sql += "zip, ";
	sql += "object ";
	sql += "from Account a ";
	sql += "where accountId = ? ";
	var accountArray = userDatabase.executeSql(sql, sqlExpression);

	if (accountArray.length > 0){
		var hasUnitAccessoryTracking = accountArray[0].hasUnitAccessoryTracking;
		var transferList = [];

		$(".taskImage[src='images/uhs/checkbox-checked.png']").each(function (){
			var localTaskReferenceId = $(this).attr("data-localTaskReferenceId");
			if (hasUnitAccessoryTracking == "1"){
				sqlExpression = [];
				sqlExpression[0] = localTaskReferenceId;
				sqlExpression[1] = localTaskReferenceId;

				sql = "select ";
				sql += "th.localTransferNumber, ";
				sql += "th.transferNumber, ";
				sql += "th.transferType, ";
				sql += "td.vendor, ";
				sql += "td.model, ";
				sql += "td.description, ";
				sql += "td.prefix, ";
				sql += "td.unit, ";
				sql += "ta.stockNumber, ";
				sql += "case when stockNumberCount is null then 0 else stockNumberCount end as stockNumberCount ";
				sql += "from TransferHeader th ";
				sql += "left outer join TransferDetail td ";
				sql += "on th.localTransferNumber = td.localTransferNumber ";
				sql += "left outer join ( select ";
				sql += "localTransferNumber, ";
				sql += "prefix, ";
				sql += "unit, ";
				sql += "stockNumber, ";
				sql += "count(*) as stockNumberCount ";
				sql += "from transferredUnitAccessories ";
				sql += "where localTransferNumber = ? ";
				sql += "group by localTransferNumber, prefix, unit, stockNumber ) ta ";
				sql += "on td.localTransferNumber = ta.localTransferNumber ";
				sql += "and td.prefix = ta.prefix ";
				sql += "and td.unit = ta.unit ";
				sql += "where th.localTransferNumber = ? ";
				sql += "order by th.localTransferNumber, td.prefix, td.unit ";
			}
			else {
				sqlExpression = [];
				sqlExpression[0] = localTaskReferenceId;
				sqlExpression[1] = localTaskReferenceId;
				sqlExpression[2] = localTaskReferenceId;

				sql = "select ";
				sql += "th.localTransferNumber, ";
				sql += "th.transferNumber, ";
				sql += "th.transferType, ";
				sql += "td.vendor, ";
				sql += "td.model, ";
				sql += "td.description, ";
				sql += "td.prefix, ";
				sql += "td.unit, ";
				sql += "ta.stockNumber, ";
				sql += "case when stockNumberCount is null then 0 else case when unitCount > 0 then stockNumberCount / unitCount else 0 end end as stockNumberCount ";
				sql += "from TransferHeader th ";
				sql += "left outer join TransferDetail td ";
				sql += "on th.localTransferNumber = td.localTransferNumber ";
				sql += "left outer join ( select ";
				sql += "localTransferNumber, ";
				sql += "prefix, ";
				sql += "'' as unit,";
				sql += "accessory as stockNumber, ";
				sql += "quantity as stockNumberCount ";
				sql += "from transferredPrefixAccessories ";
				sql += "where localTransferNumber = ? ";
				sql += "group by localTransferNumber, prefix, unit, stockNumber ) ta ";
				sql += "on td.localTransferNumber = ta.localTransferNumber ";
				sql += "and td.prefix = ta.prefix ";
				sql += "left outer join ( ";
				sql += "select localTransferNumber, prefix, count(*) as unitCount ";
				sql += "from TransferDetail ";
				sql += "where localTransferNumber = ? ";
				sql += "group by localTransferNumber, prefix ";
				sql += ") td2 ";
				sql += "on td.prefix = td2.prefix ";
				sql += "where th.localTransferNumber = ? ";
				sql += "order by th.localTransferNumber, td.prefix, td.unit ";
			}
			var resultArray = userDatabase.executeSql(sql, sqlExpression);
			var transferNumber = 0;

			if (resultArray[0].transferNumber > 0){
				transferNumber = resultArray[0].transferNumber;
			}
			else {
				transferNumber = resultArray[0].localTransferNumber;
			}

			var transferType = resultArray[0].transferType;
			var prefixCheck = "";
			var unitCheck = "";
			var prefixList = [];
			var prefixObj = null;
			var unitList = [];
			var unitObj = null;
			var accessoryList = [];
			var accessoryCount = 0;

			for (var i=0; i < resultArray.length; i++) {
				var prefix = resultArray[i].prefix;
				var unit = resultArray[i].unit;

				if (prefix + unit != unitCheck) {
					if (unitObj !== null){
						if (accessoryList !== null){
							unitObj.accessoryList = accessoryList;
							unitList.push(unitObj);
							unitObj = null;
							accessoryList = [];
							accessoryCount = 0;
						}
					}
					unitObj = {};
					unitObj.prefix = resultArray[i].prefix;
					unitObj.unit = resultArray[i].unit;
					unitCheck = resultArray[i].prefix + resultArray[i].unit;
				}

				if (prefix != prefixCheck) {
					if (prefixObj !== null){
						if (unitList !== null){
							prefixObj.unitList = unitList;
							prefixList.push(prefixObj);
							prefixObj = null;
							unitList = [];
							accessoryList = [];
							accessoryCount = 0;
						}
					}
					prefixObj = {};
					prefixObj.prefix = resultArray[i].prefix;
					prefixObj.vendor = resultArray[i].vendor;
					prefixObj.model = resultArray[i].model;
					prefixObj.description = resultArray[i].description;
					prefixCheck = resultArray[i].prefix;
				}

				var accessoryObj = {};
				if (accessoryCount === 0) {
					accessoryObj.title = "Accessories:";
				}
				else {
					accessoryObj.title = "";
				}
				accessoryObj.stockNumber = resultArray[i].stockNumber;
				accessoryObj.stockNumberCount = resultArray[i].stockNumberCount;
				accessoryList.push(accessoryObj);
				accessoryCount ++;
			}

			if (unitObj !== null){
				if (accessoryList !== null){
					unitObj.accessoryList = accessoryList;
					unitList.push(unitObj);
					unitObj = null;
					accessoryList = [];
					accessoryCount = 0;
				}
			}
			if (prefixObj !== null){
				if (unitList !== null){
					prefixObj.unitList = unitList;
					prefixList.push(prefixObj);
					prefixObj = null;
					unitList = [];
					accessoryList = [];
					accessoryCount = 0;
				}
			}
			var transferObj = {};

			if (transferType == "D"){
				transferObj.transferType = "Delivery";
			}
			else if (transferType == "P"){
				transferObj.transferType = 	"Pickup";
			}
			else if (transferType == "F"){
				transferObj.transferType = 	"Find";
			}
			else {

			}
			transferObj.transferNumber = transferNumber;
			transferObj.prefixList = prefixList;
			transferList.push(transferObj);
			}
		);

		var jsonObj = {};
 		jsonObj.transferList = transferList;

 		$.get("/public/templates/signatureDocumentation.html", function(data) {
			var template = Handlebars.compile(data);
			var templateWithData = template(jsonObj);
			jsonObj = null;

			hideInlineSignature();
			modal.open({
				content: templateWithData,
				hideSave: true,
				fullScreen: true,
				enableScroll: true
			});
			$("#modalClose").on("click", function(){
				showInlineSignature();
			});
		});
	}
	Rho.Log.info("End: signatureDocumentation", "inMotion");
}

function signatureSave(){
	Rho.Log.info("Start: signatureSave()", "inMotion");

	var errMsgs = [];
	if ($(".taskImage[src='images/uhs/checkbox-checked.png']").length < 1){
		errMsgs.push("You must select a task.\n" );
	}
	if ($("#acceptTermCondition").attr("src")=="images/uhs/checkbox-unchecked.png"){
		errMsgs.push("You must accept UHS terms and conditions.\n" );
	}
	var customerName = $("#customerName").val();
	if(customerName.length === 0){
		errMsgs.push("Customer Name is required.\n" );
	}
	if (errMsgs.length !== 0) {
		alert('The following errors must be corrected before you can continue:\n\n' + errMsgs.join('\n'));
	}
	else {
		if (!Rho.System.isRhoSimulator){
			Rho.Signature.capture(signatureSaveCallback);
		}
		//TODO remove else statement this was used for testing
		else {
			signatureSaveCallback({"status": "ok", "imageUri": ""});
		}
	}
	Rho.Log.info("End: signatureSave", "inMotion");
}

function signatureTermsConditions(){
	Rho.Log.info("Start: signatureTermsConditions()", "inMotion");
	$.get("/public/templates/termsConditions.html", function(data){
		hideInlineSignature();
		modal.open({
			content: data,
			fullScreen: true,
			hideSave: true,
			enableScroll: true
		});
		$("#modalClose").on("click", function(){
			showInlineSignature();
		});
	});
	Rho.Log.info("End: signatureTermsConditions", "inMotion");
}

function toggleSignatureCheck(params){
	Rho.Log.info("Start: toggleSignatureCheck(" + JSON.stringify(params.data) + ")", "inMotion");
	var id = params.data.localTransferNumber;
	if ($("img[data-localTaskReferenceId='" + id +"']").attr("src") == "images/uhs/checkbox-unchecked.png"){
		$("img[data-localTaskReferenceId='" + id + "']").attr("src", "images/uhs/checkbox-checked.png");
	}
	else {
		$("img[data-localTaskReferenceId='" + id + "']").attr("src", "images/uhs/checkbox-unchecked.png");
	}
	Rho.Log.info("End: toggleSignatureCheck", "inMotion");
}

function clearInlineSignature(){
	Rho.Log.info("Start: clearInlineSignature()", "inMotion");
	if (!Rho.System.isRhoSimulator){
		Rho.Signature.clear();
		showInlineSignature();
	}
	Rho.Log.info("End: clearInlineSignature", "inMotion");
}

function hideInlineSignature(){
	Rho.Log.info("Start: hideInlineSignature()", "inMotion");
	if (!Rho.System.isRhoSimulator){
		Rho.Signature.hide();
	}
	Rho.Log.info("End: hideInlineSignature", "inMotion");
}

function showInlineSignature(){
	Rho.Log.info("Start: showInLineSignature()", "inMotion");
	var pixelRatio = 1;
	if (Rho.System.platform == 'ANDROID'){
		pixelRatio = window.devicePixelRatio;
	}

	var elementLeft = Math.round($("#signatureImagePlaceholder").offset().left * pixelRatio);
	var elementTop = Math.round($("#signatureImagePlaceholder").offset().top * pixelRatio);
	var elementWidth = Math.round($("#signatureImagePlaceholder").width() * pixelRatio);
	var elementHeight =  Math.round($("#signatureImagePlaceholder").height() * pixelRatio);
	if (!Rho.System.isRhoSimulator){
		Rho.Signature.show({left: elementLeft, top: elementTop, width: elementWidth, height: elementHeight, outputFormat: "dataUri"});
	}
	else {
		$("#signatureImagePlaceholder").attr("src", "images/uhs/placeHolder400x200.png");
	}
	Rho.Log.info("End: showInLineSignature", "inMotion");
}

function signatureSaveCallback(params){
	Rho.Log.info("Start: signatureSaveCallback(" + params + ")", "inMotion");
	if (params.status == "ok") {
		if (params.imageUri.replace(/(\r\n|\n|\r)/gm,"") == "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAEsCAYAAAAfPc2WAAAABHNCSVQICAgIfAhkiAAABWRJREFUeJzt1sEJACAQwDB1/53PJQqCJBP02T0zswAAyJzXAQAAvzFYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAEDNYAAAxgwUAELtFfAZUNqHyVgAAAABJRU5ErkJggg=="){
			alert("Signature cannot be blank.");
		}
		else {
			userDatabase.startTransaction();
			try{
				var imageUri = params.imageUri;
				var adjImageUri = imageUri.replace(/(\r\n|\n|\r)/gm,"");
				var base64Image = adjImageUri.substring(22);
				var customerName = $("#customerName").val();
				var currentEmployeeId = $("#tripContainer").attr("data-currentEmployeeId");
				var tripId = $("#tripContainer").attr("data-tripId");
				var localTripId = $("#tripContainer").attr("data-localTripId");
				var accountId = $("#captureSignatureForm").attr("data-accountId");
				var currentTimestamp = getCurrentTimestampString();
				var signatureHeaderInstance = signatureHeaderModel.create({
					"accountId": accountId,
					"customerName": customerName,
					"employeeId": currentEmployeeId,
					"localSignatureId": 0,
					"signatureDateDevice": currentTimestamp,
					"signatureId": 0,
					"tripId": tripId,
					"localTripId": localTripId
				});

				signatureHeaderInstance.updateAttributes({
					"localSignatureId": signatureHeaderInstance.get("object")
				});

				$(".taskImage[src='images/uhs/checkbox-checked.png']").each(function (){
					var localTaskReferenceId = $(this).attr("data-localTaskReferenceId");
					var taskReferenceId = $(this).attr("data-taskReferenceId");
					var signatureDetailInstance = signatureDetailModel.create({
						"localReferenceId": localTaskReferenceId,
						"localSignatureDetailId": 0,
						"localSignatureId": signatureHeaderInstance.get("localSignatureId"),
						"referenceId": taskReferenceId,
						"signatureDetailId": 0,
						"signatureId": signatureHeaderInstance.get("signatureId"),
						"employeeId": currentEmployeeId,
						"documentationSent": 0
					});
					signatureDetailInstance.updateAttributes({
						"localSignatureDetailId": signatureDetailInstance.get("object")
					});
				});

				//create signature image record
				var signatureImageInstance = signatureImageModel.create({
					"base64Image": base64Image,
					"localSignatureId": signatureHeaderInstance.get("localSignatureId"),
					"localSignatureImageId": 0,
					"signatureId": signatureHeaderInstance.get("signatureId"),
					"signatureImageId": 0,
					"employeeId": currentEmployeeId
				});

				signatureImageInstance.updateAttributes({
					"localSignatureImageId": signatureImageInstance.get("object")
				});

				//create signature send to records
				var sendArray = [];
				var accountContactInstance;
				var sql;
				var sqlExpression;
				var accountContactArray;

				$(".emailContactImage[src='images/uhs/checkbox-checked.png']").each(function(){
					var localAccountContactId = $(this).attr("data-localAccountContactId");
					var accountContactId = $(this).attr("data-accountContactId");
					var contactValue = $(this).attr("data-contactValue");
					sendArray.push(localAccountContactId + "~" + accountContactId + "~" + contactValue);

					//TODO update accountContact contactLastUseDate
					sqlExpression = [];
					sqlExpression[0] = localAccountContactId;

					sql = "select accountContactId, ";
					sql += "accountId, ";
					sql += "contactLastUsedDate, ";
					sql += "contactType, ";
					sql += "contactValue, ";
					sql += "employeeId, ";
					sql += "localAccountContactId, ";
					sql += "object ";
					sql += "from AccountContact ";
					sql += "where localAccountContactId = ? ";
					accountContactArray = userDatabase.executeSql(sql, sqlExpression);

					for (i = 0; i < accountContactArray.length; i++){
						accountContactInstance = accountContactModel.make({
							"accountContactId": accountContactArray[i].accountContactId,
							"accountId": accountContactArray[i].accountId,
							"contactLastUsedDate": getCurrentTimestampString(),
							"contactType": accountContactArray[i].contactType,
							"contactValue": accountContactArray[i].contactValue,
							"employeeId": accountContactArray[i].employeeId,
							"localAccountContactId": accountContactArray[i].localAccountContactId,
							"object": accountContactArray[i].object
						});
						accountContactInstance.save();
					}
				});
				if($("#emailInput").val().length > 0) {
					var emailInput = $("#emailInput").val();
					var emailArray = emailInput.split(",");
					for (i = 0; i < emailArray.length; i++){
						//TODO lookup accountContact if it exists update contactLastUsedDate if it does not exist create a new accountContact
						sqlExpression = [];
						sqlExpression[0] = emailArray[i];
						sqlExpression[1] = accountId;

						sql = "select accountContactId, ";
						sql += "accountId, ";
						sql += "contactLastUsedDate, ";
						sql += "contactType, ";
						sql += "contactValue, ";
						sql += "employeeId, ";
						sql += "localAccountContactId, ";
						sql += "object ";
						sql += "from AccountContact ";
						sql += "where contactValue = ? ";
						sql += "and contactType = 'E' ";
						sql += "and accountId = ? ";
						accountContactArray = userDatabase.executeSql(sql, sqlExpression);

						if (accountContactArray.length > 0){
							accountContactInstance = accountContactModel.make({
								"accountContactId": accountContactArray[0].accountContactId,
								"accountId": accountContactArray[0].accountId,
								"contactLastUsedDate": getCurrentTimestampString(),
								"contactType": accountContactArray[0].contactType,
								"contactValue": accountContactArray[0].contactValue,
								"employeeId": accountContactArray[0].employeeId,
								"localAccountContactId": accountContactArray[0].localAccountContactId,
								"object": accountContactArray[0].object
							});
							accountContactInstance.save();
						}
						else {
							accountContactArray = userDatabase.executeSql(sql, sqlExpression);
							accountContactInstance = accountContactModel.create({
								"accountContactId": 0,
								"accountId": accountId,
								"contactLastUsedDate": getCurrentTimestampString(),
								"contactType": "E",
								"contactValue": emailArray[i],
								"localAccountContactId": 0,
								"employeeId": currentEmployeeId
							});
							accountContactInstance.updateAttributes({
								"localAccountContactId": accountContactInstance.get("object")
							});
						}
						sendArray.push(accountContactInstance.get("localAccountContactId") + "~" + accountContactInstance.get("accountContactId") + "~" + accountContactInstance.get("contactValue"));
					}
				}
				if($("#faxInput").val().length > 0) {
					var faxInput = $("#faxInput").val();
					//TODO lookup accountContact if it exists update contactLastUsedDate if it does not exist create a new accountContact
					sqlExpression = [];
					sqlExpression[0] = faxInput;
					sqlExpression[1] = accountId;

					sql = "select accountContactId, ";
					sql += "accountId, ";
					sql += "contactLastUsedDate, ";
					sql += "contactType, ";
					sql += "contactValue, ";
					sql += "employeeId, ";
					sql += "localAccountContactId, ";
					sql += "object ";
					sql += "from AccountContact ";
					sql += "where contactValue = ? ";
					sql += "and contactType = 'F' ";
					sql += "and accountId = ? ";

					accountContactArray = userDatabase.executeSql(sql, sqlExpression);
					if (accountContactArray.length > 0){
						accountContactInstance = accountContactModel.make({
							"accountContactId": accountContactArray[0].accountContactId,
							"accountId": accountContactArray[0].accountId,
							"contactLastUsedDate": getCurrentTimestampString(),
							"contactType": accountContactArray[0].contactType,
							"contactValue": accountContactArray[0].contactValue,
							"employeeId": accountContactArray[0].employeeId,
							"localAccountContactId": accountContactArray[0].localAccountContactId,
							"object": accountContactArray[0].object
						});
						accountContactInstance.save();
					}
					else {
						accountContactInstance = accountContactModel.create({
							"accountContactId": 0,
							"accountId": accountId,
							"contactLastUsedDate": getCurrentTimestampString(),
							"contactType": "F",
							"contactValue": faxInput,
							"localAccountContactId": 0,
							"employeeId": currentEmployeeId
						});
						accountContactInstance.updateAttributes({
							"localAccountContactId": accountContactInstance.get("object")
						});
					}
					sendArray.push(accountContactInstance.get("localAccountContactId") + "~" + accountContactInstance.get("accountContactId") + "~" + accountContactInstance.get("contactValue"));
				}
				else {
					$(".faxContactImage[src='images/uhs/radiobutton-checked.png']").each(function(){
						var localAccountContactId = $(this).attr("data-localAccountContactId");
						var accountContactId = $(this).attr("data-accountContactId");
						var contactValue = $(this).attr("data-contactValue");
						sendArray.push(localAccountContactId + "~" + accountContactId + "~" + contactValue);

						//TODO update accountContact contactLastUsedDate
						sqlExpression = [];
						sqlExpression[0] = localAccountContactId;

						sql = "select accountContactId, ";
						sql += "accountId, ";
						sql += "contactLastUsedDate, ";
						sql += "contactType, ";
						sql += "contactValue, ";
						sql += "employeeId, ";
						sql += "localAccountContactId, ";
						sql += "object ";
						sql += "from AccountContact ";
						sql += "where localAccountContactId = ? ";
						var accountContactArray = userDatabase.executeSql(sql, sqlExpression);

						for (i = 0; i < accountContactArray.length; i++){
							var accountContactInstance = accountContactModel.make({
								"accountContactId": accountContactArray[i].accountContactId,
								"accountId": accountContactArray[i].accountId,
								"contactLastUsedDate": getCurrentTimestampString(),
								"contactType": accountContactArray[i].contactType,
								"contactValue": accountContactArray[i].contactValue,
								"employeeId": accountContactArray[i].employeeId,
								"localAccountContactId": accountContactArray[i].localAccountContactId,
								"object": accountContactArray[i].object
							});
							accountContactInstance.save();
						}
					});
				}
				var i;

				for (i = 0; i < sendArray.length; i++){
					var localAccountContactId = sendArray[i].split("~")[0];
					var accountContactId = sendArray[i].split("~")[1];
					var signatureSendInstance = signatureSendModel.create({
						"accountContactId": accountContactId,
						"localAccountContactId": localAccountContactId,
						"localSignatureId": signatureHeaderInstance.get("localSignatureId"),
						"localSignatureSendId": 0,
						"signatureId": signatureHeaderInstance.get("signatureId"),
						"signatureSendId": 0,
						"employeeId": currentEmployeeId
					});
					signatureSendInstance.updateAttributes({
						"localSignatureSendId": signatureSendInstance.get("object")
					});
				}

				var transferHeaderString = "";
				$(".taskImage[src='images/uhs/checkbox-checked.png']").each(function (){
					var localTaskReferenceId = $(this).attr("data-localTaskReferenceId");
					transferHeaderString += localTaskReferenceId + ",";
				});
				transferHeaderString = transferHeaderString.substr(0, transferHeaderString.length - 1);

				sql = "select accountId, ";
				sql += "comment, ";
				sql += "cstat, ";
				sql += "deliveredByEmployeeId, ";
				sql += "deliveryDate, ";
				sql += "localSwapOutNumber, ";
				sql += "localTransferNumber, ";
				sql += "localUhsPatientId, ";
				sql += "orderBy, ";
				sql += "orderDate, ";
				sql += "postedByEmployeeId, ";
				sql += "purchaseOrder, ";
				sql += "status, ";
				sql += "swapOutFlag, ";
				sql += "swapOutNumber, ";
				sql += "telephoneNumber, ";
				sql += "transferDate, ";
				sql += "transferNumber, ";
				sql += "transferType, ";
				sql += "transferredByEmployeeId, ";
				sql += "uhsPatientId, ";
				sql += "object ";
				sql += "from transferHeader ";
				sql += "where localTransferNumber in ( " + transferHeaderString + " ) ";
				var transferHeaderArray = userDatabase.executeSql(sql);

				for (i = 0; i < transferHeaderArray.length; i++){
					var deliveryDate = "0001-01-01 00:00:00.0";
					var deliveredByEmployeeId = 0;
					if (transferHeaderArray[i].transferType == "P"){
						deliveryDate = currentTimestamp;
						deliveredByEmployeeId = currentEmployeeId;
					}
					else {
						deliveryDate = transferHeaderArray[i].deliveryDate;
						deliveredByEmployeeId = transferHeaderArray[i].deliveredByEmployeeId;
					}
					var transferHeaderInstance = transferHeaderModel.make({
						"accountId": transferHeaderArray[i].accountId,
						"comment": transferHeaderArray[i].comment,
						"cstat" : transferHeaderArray[i].cstat,
						"deliveredByEmployeeId": deliveredByEmployeeId,
						"deliveryDate": deliveryDate,
						"department": transferHeaderArray[i].department,
						"localSwapOutNumber": transferHeaderArray[i].localSwapOutNumber,
						"localTransferNumber": transferHeaderArray[i].localTransferNumber,
						"localUhsPatientId": transferHeaderArray[i].localUhsPatientId,
						"orderBy": transferHeaderArray[i].orderby,
						"orderDate": transferHeaderArray[i].orderDate,
						"postedByEmployeeId": transferHeaderArray[i].postedByEmployeeId,
						"purchaseOrder": transferHeaderArray[i].purchaseOrder,
						"status": "C",
						"swapOutFlag": transferHeaderArray[i].swapOutFlag,
						"swapOutNumber": transferHeaderArray[i].swapOutNumber,
						"telephoneNumber": transferHeaderArray[i].telephoneNumber,
						"transferDate": transferHeaderArray[i].transferDate,
						"transferNumber": transferHeaderArray[i].transferNumber,
						"transferType" : transferHeaderArray[i].transferType,
						"transferredByEmployeeId": transferHeaderArray[i].transferredByEmployeeId,
						"uhsPatientId": transferHeaderArray[i].uhsPatientId,
						"employeeId": currentEmployeeId,
						"object": transferHeaderArray[i].object
					});
					transferHeaderInstance.save();
				}

				hideInlineSignature();
				$("#tripContainer").attr("data-applicationMode", "");
				readTripDetail();
				$("#headerListContent").empty();
				$("#frameListContent").empty();
				userDatabase.commitTransaction();
			}
			catch(e) {
				Rho.Log.info("Error: signatureSaveCallback rollback = " + e, "inMotion");
				userDatabase.rollbackTransaction();
			}
			finally {
				Rho.Log.info("End: signatureSaveCallback", "inMotion");
			}
		}
	}
	else {
		Rho.Log.info("Error: signatureSaveCallback = Signature capture failed", "inMotion");
		alert("Signature capture failed");
	}
}

function toggleTasks(id){
	Rho.Log.info("Start: toggleTasks(" + id + ")", "inMotion");
	$(".taskContainer[data-accountId=" + id + "]").each(function(){
		if ($(this).is(":visible")){
			$(this).hide();
		}
		else {
			$(this).show();
		}
	});
	enableScanner();
	hideMenu();
	Rho.Log.info("End: toggleTasks", "inMotion");
}