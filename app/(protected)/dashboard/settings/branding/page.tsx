"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Upload01Icon,
  Image01Icon,
  Delete01Icon,
  ChatBotIcon,
  BubbleChatSparkIcon,
  ArtificialIntelligence02Icon,
  AiMagicIcon,
  AiBrain01Icon,
  CustomerSupportIcon,
  BubbleChatQuestionIcon,
  BubbleChatIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import {
  ChatBotIcon as ChatBotIconSolid,
  BubbleChatSparkIcon as BubbleChatSparkIconSolid,
  ArtificialIntelligence02Icon as ArtificialIntelligence02IconSolid,
  AiMagicIcon as AiMagicIconSolid,
  AiBrain01Icon as AiBrain01IconSolid,
  CustomerSupportIcon as CustomerSupportIconSolid,
  BubbleChatQuestionIcon as BubbleChatQuestionIconSolid,
  BubbleChatIcon as BubbleChatIconSolid,
} from "@hugeicons-pro/core-solid-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAgent } from "@/lib/agent-context"

const presetColors = [
  { name: "Teal", value: "#0d9488" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Slate", value: "#64748b" },
]

const iconOptions = [
  { name: "AI Brain", bulk: AiBrain01Icon, solid: AiBrain01IconSolid },
  { name: "Chatbot", bulk: ChatBotIcon, solid: ChatBotIconSolid },
  { name: "Bubble Spark", bulk: BubbleChatSparkIcon, solid: BubbleChatSparkIconSolid },
  { name: "AI", bulk: ArtificialIntelligence02Icon, solid: ArtificialIntelligence02IconSolid },
  { name: "AI Magic", bulk: AiMagicIcon, solid: AiMagicIconSolid },
  { name: "Support", bulk: CustomerSupportIcon, solid: CustomerSupportIconSolid },
  { name: "Spørgsmål", bulk: BubbleChatQuestionIcon, solid: BubbleChatQuestionIconSolid },
  { name: "Chat", bulk: BubbleChatIcon, solid: BubbleChatIconSolid },
]

type IconStyle = "bulk" | "solid"

export default function BrandingPage() {
  const { currentAgent } = useAgent()
  const [primaryColor, setPrimaryColor] = useState("#0d9488")
  const [customColor, setCustomColor] = useState("")
  const [logo, setLogo] = useState<string | null>(null)
  const [useIcon, setUseIcon] = useState(true)
  const [selectedIcon, setSelectedIcon] = useState(0)
  const [iconStyle, setIconStyle] = useState<IconStyle>("bulk")
  const [saved, setSaved] = useState(false)

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = () => {
    setLogo("/placeholder.svg")
    setUseIcon(false)
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    setUseIcon(true)
  }

  const CurrentIcon = iconStyle === "solid" 
    ? iconOptions[selectedIcon].solid 
    : iconOptions[selectedIcon].bulk

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Branding</h2>
        <p className="text-sm text-muted-foreground">
          Tilpas udseendet af din chatbot widget til at matche dit brand.
        </p>
      </div>

      <div className="space-y-6 px-4 lg:px-6">
        {/* Logo / Icon */}
        <Card>
          <CardHeader>
            <CardTitle>Logo eller ikon</CardTitle>
            <CardDescription>
              Upload dit logo eller vælg et ikon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            <div className="flex items-center gap-4">
              <div
                className="flex size-16 items-center justify-center rounded-2xl shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {logo && !useIcon ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="size-10 object-contain"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={CurrentIcon}
                    size={28}
                    className="text-white"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">Widget preview</p>
                <p className="text-sm text-muted-foreground">
                  Sådan vil din chat-knap se ud
                </p>
              </div>
            </div>

            {/* Icon style toggle */}
            <div>
              <Label className="mb-3 block text-sm">Ikon-stil</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIconStyle("bulk")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                    iconStyle === "bulk"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <HugeiconsIcon icon={AiBrain01Icon} size={18} />
                  Bulk
                </button>
                <button
                  type="button"
                  onClick={() => setIconStyle("solid")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                    iconStyle === "solid"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <HugeiconsIcon icon={AiBrain01IconSolid} size={18} />
                  Solid
                </button>
              </div>
            </div>

            {/* Icon selection */}
            <div>
              <Label className="mb-3 block text-sm">Vælg ikon</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {iconOptions.map((option, index) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(index)
                      setUseIcon(true)
                    }}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-muted/50",
                      selectedIcon === index && useIcon
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/30"
                    )}
                    title={option.name}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg transition-colors",
                        selectedIcon === index && useIcon
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <HugeiconsIcon 
                        icon={iconStyle === "solid" ? option.solid : option.bulk} 
                        size={20} 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <Label className="mb-3 block text-sm">Eller upload dit logo</Label>
              {logo && !useIcon ? (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <HugeiconsIcon
                    icon={Image01Icon}
                    size={20}
                    className="text-muted-foreground"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo uploadet</p>
                    <p className="text-xs text-muted-foreground">
                      Dit logo vises i chatbot widgetten
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} className="mr-1" />
                    Fjern
                  </Button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleLogoUpload}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleLogoUpload()
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                    <HugeiconsIcon
                      icon={Upload01Icon}
                      size={20}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload logo</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG eller SVG (max 2 MB)
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Upload er kun visuelt i denne demo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Primær farve</CardTitle>
            <CardDescription>
              Vælg en farve til din chatbot widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset colors */}
            <div>
              <Label className="mb-2 block text-sm">Forudindstillede farver</Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(color.value)
                      setCustomColor("")
                    }}
                    className={cn(
                      "group relative size-10 rounded-lg transition-all hover:scale-110",
                      primaryColor === color.value && "ring-2 ring-offset-2 ring-foreground"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {primaryColor === color.value && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={16}
                        className="absolute inset-0 m-auto text-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom color */}
            <div>
              <Label htmlFor="custom-color" className="mb-2 block text-sm">
                Egen farve
              </Label>
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    id="custom-color"
                    type="color"
                    value={customColor || primaryColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value)
                      setPrimaryColor(e.target.value)
                    }}
                    className="size-10 cursor-pointer p-1"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="#0d9488"
                  value={customColor || primaryColor}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                      setCustomColor(value)
                      if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        setPrimaryColor(value)
                      }
                    }
                  }}
                  className="w-32 font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saved}>
          {saved ? (
            <>
              <HugeiconsIcon icon={Tick02Icon} size={16} className="mr-2" />
              Gemt!
            </>
          ) : (
            "Gem ændringer"
          )}
        </Button>
      </div>
    </div>
  )
}
