const controller = {};

controller.getperformance = (req, res) => {
    // if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM `TB_TR_PERFORMANCE`', (err, performance) => {
            conn.query('SELECT `TB_TR_TRAFFIC`.`rxkB/s` as rxkB,`TB_TR_TRAFFIC`.`txkB/s` as txkB FROM `TB_TR_TRAFFIC` WHERE iface != "lo" GROUP BY iface ORDER BY traffic_id DESC', (err, traffic) => {

                res.send({ data: performance, data2: traffic })
            });
        });
    });
    // }
};

module.exports = controller;