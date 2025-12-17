local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = exports.qbx_core:GetPlayer(playerId)

    if player then
        local playerData <const> = player.PlayerData
        return playerData and playerData.citizenid or nil
    end
    
    return nil
end

function framework.getPlayerName(playerId)
    local player <const> = exports.qbx_core:GetPlayer(playerId)

    if player then
        local playerData <const> = player.PlayerData

        if playerData then
            local charinfo <const> = playerData.charinfo
            return charinfo and (charinfo.firstname .. " " .. charinfo.lastname) or "undefined"
        end
    end

    return "undefined"
end

function framework.getPlayer(playerId)
    local player <const> = exports.qbx_core:GetPlayer(playerId)

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