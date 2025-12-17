local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = exports.ND_Core:getPlayer(playerId)
    return player and player.id or nil
end

function framework.getPlayerName(playerId)
    local player <const> = exports.ND_Core:getPlayer(playerId)
    return player and (player.firstname .. " " .. player.lastname) or "undefined"
end

function framework.getPlayer(playerId)
    local player <const> = exports.ND_Core:getPlayer(playerId)

    if player then
        return {
            getName = function()
                return framework.getPlayerName(playerId)
            end
        }
    end

    return nil
end

return framework