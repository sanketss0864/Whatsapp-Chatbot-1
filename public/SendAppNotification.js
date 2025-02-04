var InAppNotificationWrapper= window.InAppNotificationWrapper || {};
InAppNotificationWrapper.SendAppNotificationRequest = function (
   title, 
   recipient, 
   body, 
   priority, 
   iconType, 
   toastType, 
   expiry, 
   overrideContent, 
   actions) 
{
    this.Title = title;
    this.Recipient = recipient;
    this.Body = body;
    this.Priority = priority;
    this.IconType = iconType;
    this.ToastType = toastType;
    this.Expiry = expiry;
    this.OverrideContent = overrideContent;
    this.Actions = actions;
};

InAppNotificationWrapper.SendAppNotificationRequest.prototype.getMetadata = function () {
    return {
        boundParameter: null,
        parameterTypes: {
            "Title": {
                "typeName": "Edm.String",
                "structuralProperty": 1
            },
            "Recipient": {
                "typeName": "mscrm.systemuser",
                "structuralProperty": 5
            },
            "Body": {
                "typeName": "Edm.String",
                "structuralProperty": 1
            },
            "Priority": {
                "typeName": "Edm.Int",
                "structuralProperty": 1
            },
            "IconType": {
                "typeName": "Edm.Int",
                "structuralProperty": 1
            },
            "ToastType": {
                "typeName": "Edm.Int",
                "structuralProperty": 1
            },
            "Expiry": {
                "typeName": "Edm.Int",
                "structuralProperty": 1
            },
            "OverrideContent": {
                "typeName": "mscrm.expando",
                "structuralProperty": 5
            },
            "Actions": {
                "typeName": "mscrm.expando",
                "structuralProperty": 5
            },
        },
        operationType: 0, 
        operationName: "SendAppNotification",
    };
};