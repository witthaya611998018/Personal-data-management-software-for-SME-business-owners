const express = require('express');
const router = express.Router();

const agentController = require('../controllers/agentsController');
const validator = require('../controllers/validator')

// Manager Page
router.get('/agent_manage',agentController.manager);
// New Page
router.get('/new_agent_manage',agentController.newManager);
router.post('/agent_manage/add',agentController.addManage);
// Detail page
router.get('/detail_agent_manage/:id',agentController.detailManage);
router.get('/agent_manage/procedure/:id', agentController.procedureManage);
router.get('/agent_manage/procedureWindows/:id', agentController.procedureManage1);
// Edit Page
router.get('/edit_agent_manage/:id',agentController.editManager);
router.post('/agent_manage/update:id',agentController.updateManage);
// Delete Manage
router.post('/delete_agent_manage/:id/:index',agentController.deleteManage);
//Agent Client 2
router.get('/file_log_ag',agentController.fileLogAg);
// SEND AJAX
router.post('/agent_manage',agentController.manager1);
router.post('/agent_manage/selectStore',agentController.selectStore);
router.post('/agent_manage/selectManage', agentController.selectManage);
router.post('/agent_manage/connect/',agentController.testConnect);
router.post('/agent_manage/update/status:id',agentController.updateStatusManage);
router.post('/file_log_ag',agentController.fileLogAg1);
router.post('/file_log_ag/detail',agentController.fileLogAg1Detail);
router.post('/database_ag',agentController.databaseAg1);
router.post('/database_ag/select',agentController.databaseAg2);
router.post('/database_ag/selectDel',agentController.databaseAg3);
router.post('/logger_ag',agentController.loggerAg1);
router.post('/logger_ag/select',agentController.loggerAg2);
router.post('/agent_sniffer',agentController.sniffer1);
router.post('/agent_sniffer/charts',agentController.chartSniffer);
router.post('/agent_store',agentController.store1);
router.post('/agent/search',agentController.searchGlobal);
router.post('/agent/getSearch',agentController.selectSearchGlobal);
//Agent Client 3
router.get('/database_ag',agentController.databaseAg);
// Delete Record
router.post('/database_ag/delete:id',agentController.delDatabaseAg)
//Agent Client 1
router.get('/logger_ag',agentController.loggerAg);
// Sniffer
router.get('/agent_sniffer',agentController.sniffer);
// Store
router.get('/agent_store',agentController.store);
// Update status
router.post('/agent_store/update:id',agentController.updateStore);
// Detail servicer
router.get('/agent_store/detail:id',agentController.detailStore);

module.exports = router
