module.exports = (app, io) => {
    app.use('/api/v1/auth', require('./routes/api/v1/auth/auth'));
    // app.use('/api/v1/user', require('./routes/api/v1/user'));
    // app.use('/api/v1/company', require('./routes/api/v1/company'));
    // app.use('/api/v1/waRoutes', require('./routes/api/v1/waRoutes'));
    // app.use('/api/v1/payment', require('./routes/api/v1/payment'));
    // app.use('/api/v1/sendMessage', require('./routes/api/v1/messageRoute'));
    // app.use('/api/v1/check', require('./routes/api/v1/messageRoute'));
    // app.use('/api/v1/createTicket', require('./routes/api/v1/ticketRoutes'))
    // app.use('/api/v1/ticket', require('./routes/api/v1/tickets'))
    // app.use('/api/v1/admin', require('./routes/api/v1/admin'))
    
    app.use('/api/v1/dash', require('./routes/api/v1/dashboard/main'));
    app.use('/api/v1/message', require('./routes/api/v1/dashboard/main'));
    app.use('/api/v1/dash/wa', require('./routes/api/v1/dashboard/wa'));
    app.use('/api/v1/dash/announcement', require('./routes/api/v1/dashboard/announcements'));
    app.use('/api/v1/dash/payment', require('./routes/api/v1/dashboard/payment'));
    app.use('/api/v1/dash/broadcast',require('./routes/api/v1/dashboard/broadcast'));
    app.use('/api/v1/dash/company',require('./routes/api/v1/dashboard/company'));
    app.use('/api/v1/dash/ticket',require('./routes/api/v1/dashboard/ticket'))
    

    const { initializeSocket } = require('./sockets');
    initializeSocket(io);

}