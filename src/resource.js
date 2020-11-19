const names = ["rooms", "messages", "memberships", "attachmentActions"];

const options = {
    rooms: {
        description: 'rooms',
        events: [
            'all',
            'created',
            'updated'
        ]
    },
    messages: {
        description: 'messages',
        events: [
            'all',
            'created',
            'deleted'
        ]
    },
    memberships: {
        description: 'memberships',
        events: [
            'all',
            'created',
            'updated',
            //'seen',
            'deleted'
        ]
    },
    attachmentActions: {
        description: 'attachmentActions',
        events: [
            'created'
        ]
    },
};


module.exports = {
    names,
    options
};
