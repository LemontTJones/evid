local framework = {}
local ESX <const> = exports.es_extended:getSharedObject()

function framework.getIdentifier(playerId)
    local xPlayer <const> = ESX.GetPlayerFromId(playerId)
    return xPlayer and xPlayer.identifier or nil
end

function framework.getPlayerName(playerId)
    local xPlayer <const> = ESX.GetPlayerFromId(playerId)
    return xPlayer and xPlayer.getName() or "undefined"
end

function framework.getPlayer(playerId)
    local xPlayer <const> = ESX.GetPlayerFromId(playerId)

    if xPlayer then
        return {
            getName = function()
                return xPlayer.getName()
            end
        }
    end

    return nil
end

return framework
