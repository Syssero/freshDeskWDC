(function () {

    var myConnector = tableau.makeConnector();

    myConnector.init = function (initCallback) {

        tableau.authType = tableau.authTypeEnum.basic;
        initCallback();
    };

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "source",
            alias: "source",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "priority_name",
            alias: "priority",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "created_at",
            alias: "Created at",
            dataType: tableau.dataTypeEnum.datetime
        },
        {
            id: "updated_at",
            alias: "updated_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "first_response_escalated",
            alias: "first_response_escalated",
            dataType: tableau.dataTypeEnum.bool
        },
        {
            id: "documentation_required",
            alias: "documentation_required",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "ticket_type",
            alias: "ticket_type",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "company_id",
            alias: "company_id",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "company_name",
            alias: "company_name",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "due_by",
            alias: "due_by",
            dataType: tableau.dataTypeEnum.datetime
        },
        {
            id: "requester_name",
            alias: "requester_name",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "requester_id",
            alias: "requester_id",
            dataType: tableau.dataTypeEnum.string
        },
        {
            id: "subject",
            alias: "subject",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "status_name",
            alias: "status",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "responder_name",
            alias: "agent",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "agent_responded_at",
            alias: "agent_responded_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "requester_responded_at",
            alias: "requester_responded_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "first_responded_at",
            alias: "first_responded_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "status_updated_at",
            alias: "status_updated_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "reopened_at",
            alias: "reopened_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "resolved_at",
            alias: "resolved_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "closed_at",
            alias: "closed_at",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "pending_since",
            alias: "pending_since",
            dataType: tableau.dataTypeEnum.datetime
        },
		{
            id: "syssero_internal_only_project_name",
            alias: "syssero_internal_only_project_name",
            dataType: tableau.dataTypeEnum.string
        }, 
		//added for #6034
		{
            id: "details",
            alias: "details",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "request_type",
            alias: "request_type",
            dataType: tableau.dataTypeEnum.string
        },
		//added for #7009
		{
            id: "email_config_id",
            alias: "email_config_id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "group_id",
            alias: "group_id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "association_type",
            alias: "association_type",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "product_id",
            alias: "product_id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "first_response_due_by",
            alias: "first_response_due_by",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "ticket_escalated",
            alias: "ticket_escalated",
            dataType: tableau.dataTypeEnum.bool
        }, {
            id: "syssero_support_area",
            alias: "syssero_support_area",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "key_impacted_module",
            alias: "key_impacted_module",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "effective_date",
            alias: "effective_date",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "available_for_resourcing",
            alias: "available_for_resourcing",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "associated_tickets_count",
            alias: "associated_tickets_count",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "internal_agent_id",
            alias: "internal_agent_id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "internal_group_id",
            alias: "internal_group_id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "next_response_due_by",
            alias: "next_response_due_by",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "next_response_escalated",
            alias: "next_response_escalated",
            dataType: tableau.dataTypeEnum.bool
        },
		//added for #7090
		{
            id: "estimated_hours",
            alias: "estimated_hours",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "systics_originated",
            alias: "systics_originated",
            dataType: tableau.dataTypeEnum.bool
        },];

        var tableSchema = {
            id: "freshdeskFeed",
            alias: "Freshdesk Ticket Info",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };



    myConnector.getData = function (table, doneCallback) {
        const apiKey = tableau.password;
		var ticketUpdatedSince = new Date();
		ticketUpdatedSince.setMonth(ticketUpdatedSince.getMonth() - 5);
		ticketUpdatedSince = ticketUpdatedSince.toISOString().slice(0, 10);
		var sleepCount = 1;

        function loop(x, agent_array) {

            //console.log(agent_array[0])
            $.ajax({
                type: "GET",
                url: `https://syssero.freshdesk.com/api/v2/tickets?updated_since=${ticketUpdatedSince}&page=${x}&per_page=100&include=stats,requester,company`,
                dataType: 'json',
                headers: {
                    "Authorization": "Basic " + btoa(apiKey + ":123")
                }
            }).done(function (resp, status, xhr) {
                //console.log(customers)
                console.log(x)
                var response = resp,
                    tableData = [];
                // console.log(xhr)
                //console.log(agent_array.filter(agent => agent.id == '42019954398')[0].contact.name)

                if (resp.length > 0) {
                    var dateFormat = "Y-MM-DD HH:mm:ss";
                    // Iterate over the JSON object
                    for (var i = 0, len = response.length; i < len; i++) {

                        // if (i == 0 && response[i].owner_id != null) {
                        //     console.log((customers.filter(c => c.customer.id == response[i].owner_id))[0].customer.name)
                        //     console.log(response[i].owner_id)
                        // }

                        var priority_map = ['Low', 'Medium', 'High', 'Urgent']

                        var source_map = ['Email', 'Portal', 'Phone']

                        var status_map = ['Open', 'Pending', 'Resolved', 'Closed', '', '', 'Pending in Sandbox Tenant', 'Pending in Implementation Tenant', 'Pending in Preview Tenant', 'On hold', 'Roadmap']

                        tableData.push({
                            "id": (response[i].id).toString(),
                            "source": source_map[response[i].source - 1],
                            "priority_name": priority_map[response[i].priority - 1],
                            "created_at": moment(response[i].created_at).format(dateFormat),
                            "updated_at": moment(response[i].updated_at).format(dateFormat),
                            "first_response_escalated": response[i].fr_escalated,
                            "documentation_required": (response[i].custom_fields.cf_documentation_required == null ? 'Empty' : response[i].custom_fields.cf_documentation_required),
                            "ticket_type": (response[i].type == null ? 'Empty' : response[i].type),
                            "company_id": response[i].company.id,
                            "company_name": response[i].company.name,
                            "due_by": moment(response[i].due_by).format(dateFormat),
                            "requester_name": response[i].requester.name,
                            "requester_id": (response[i].requester.id).toString(),
                            "subject": response[i].subject,
                            "status_name": status_map[response[i].status - 2],
                            "responder_name": agent_array.filter(agent => agent.id == response[i].responder_id)[0] == undefined ? 'no agent' : agent_array.filter(agent => agent.id == response[i].responder_id)[0].contact.name,
                            "agent_responded_at": response[i].stats.agent_responded_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.agent_responded_at).format(dateFormat),
                            "requester_responded_at": response[i].stats.requester_responded_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.requester_responded_at).format(dateFormat),
                            "first_responded_at": response[i].stats.first_responded_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.first_responded_at).format(dateFormat),
                            "status_updated_at": response[i].stats.status_updated_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.status_updated_at).format(dateFormat),
                            "reopened_at": response[i].stats.reopened_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.reopened_at).format(dateFormat),
                            "resolved_at": response[i].stats.resolved_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.resolved_at).format(dateFormat),
                            "closed_at": response[i].stats.closed_at == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.closed_at).format(dateFormat),
                            "pending_since": response[i].stats.pending_since == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].stats.pending_since).format(dateFormat),
							"syssero_internal_only_project_name": (response[i].custom_fields.cf_syssero_internal_only_client_name == null ? 'Empty' : response[i].custom_fields.cf_syssero_internal_only_client_name),
							"details": (response[i].custom_fields.cf_details == null ? 'Empty' : response[i].custom_fields.cf_details),
							"request_type": (response[i].custom_fields.cf_request_type == null ? 'Empty' : response[i].custom_fields.cf_request_type),
							"email_config_id": response[i].email_config_id,
							"group_id": response[i].group_id,
							"association_type": response[i].association_type,
							"product_id": response[i].product_id,
							"first_response_due_by": response[i].fr_due_by == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].fr_due_by).format(dateFormat),
							"ticket_escalated": response[i].is_escalated,
							"syssero_support_area": (response[i].custom_fields.cf_syssero_support_area == null ? 'Empty' : response[i].custom_fields.cf_syssero_support_area),
							"key_impacted_module": (response[i].custom_fields.cf_key_impacted_module == null ? 'Empty' : response[i].custom_fields.cf_key_impacted_module),
							"effective_date": response[i].custom_fields.cf_effective_date == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].custom_fields.cf_effective_date).format(dateFormat),
							"available_for_resourcing": (response[i].custom_fields.cf_available_for_resourcing == null ? 'Empty' : response[i].custom_fields.cf_available_for_resourcing),
							"associated_tickets_count": response[i].associated_tickets_count,
							"internal_agent_id": response[i].internal_agent_id,
							"internal_group_id": response[i].internal_group_id,
							"next_response_due_by": response[i].nr_due_by == null ? moment('1800-01-01').format(dateFormat) : moment(response[i].nr_due_by).format(dateFormat),
							"next_response_escalated": response[i].nr_escalated,
							"estimated_hours": response[i].custom_fields.cf_estimated_hours,
							"systics_originated": response[i].custom_fields.cf_systics_originated
                        });
                    }

                    table.appendRows(tableData);
					if(x === sleepCount * 20) {
						sleepCount++;
						sleep(3000);
					}
					console.log(`x: ${x}`);
					console.log(`sleepCount: ${sleepCount}`);
                    loop(x + 1, agent_array)

                } else { doneCallback(); }



            });
        }

		function sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}


        function loop_agents(x, arr) {

            $.ajax({
                type: "GET",
                url: `https://syssero.freshdesk.com/api/v2/agents?&page=${x}&per_page=100`,
                dataType: 'json',
                headers: {
                    "Authorization": "Basic " + btoa(apiKey + ":123")
                }
            }).done(function (resp) {
                var response = resp


                if (resp.length > 0) {

                    // Iterate over the JSON object
                    for (var i = 0, len = response.length; i < len; i++) {

                        arr.push(response[i])
                    }


                    loop_agents(x + 1, arr)

                } else {

                    loop(1, arr)

                }
            })



        }


        loop_agents(1, [])





    }

    tableau.registerConnector(myConnector);

    $(document).ready(function () {

        $("#submitButton").click(function () {
            if ($("#key").val().length > 0) {
                tableau.password = $("#key").val()
                tableau.connectionName = "Freshdesk Feed";

                tableau.submit();
            } else {
                alert('Please enter API key')
            }



        });
    });

})();