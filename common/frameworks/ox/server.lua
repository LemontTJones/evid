local framework = {}
local ox = require "@ox_core.lib.init"

function framework.getIdentifier(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)
    return oxPlayer and oxPlayer.charId or nil
end

function framework.getPlayerName(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)

    if oxPlayer then
        local firstName <const> = oxPlayer.get("firstName")
        local lastName <const> = oxPlayer.get("lastName")

        if firstName and lastName then
            return firstName .. " " .. lastName
        end
    end

    return "undefined"
end

function framework.getPlayer(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)

    if oxPlayer then
        return {
            getName = function()
                return framework.getPlayerName(playerId)
            end
        }
    end

    return nil
end

return framework