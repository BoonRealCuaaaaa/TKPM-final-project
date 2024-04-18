const controller = {};

controller.role = async (req, res, next) => {
    let type = req.session.accountType;
    if (type == 'ward') res.locals.role = req.session.accountWard + ' - ' + req.session.accountDistrict;
    else if (type == 'district') res.locals.role = req.session.accountDistrict;
    else if (type == 'department') res.locals.role = 'Sở';

    res.locals.accountType = req.session.accountType;

    next();
}

module.exports = controller;