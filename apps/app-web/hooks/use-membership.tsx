"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react"
import { toast } from "sonner"

export interface Membership {
  id: number;
  tier: "level1" | "level2" | "level3" | "level4" | "level5" | "level6" | "level7";
  points: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
}

interface MembershipContextType {
  membership: Membership | null;
  isLoading: boolean;
  tierDiscount: number;
  pointsToNextTier: number;
  isEligibleForUpgrade: boolean;
  nextTier: string | null;
  addPoints: (points: number) => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined)

export const MembershipProvider = ({ children }: { children: ReactNode }) => {
  const [membership, setMembership] = useState<Membership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Calculate tier discount based on level
  const getTierDiscount = (tier: string | undefined) => {
    switch(tier) {
      case "level1": return 0.3;  // 30% discount
      case "level2": return 0.1;  // 10% discount
      case "level3": return 0.05; // 5% discount
      default: return 0;
    }
  }
  
  const tierDiscount = getTierDiscount(membership?.tier)
  
  // Define tier thresholds
  const tierThresholds = {
    level7: 100,
    level6: 200,
    level5: 400,
    level4: 1000,
    level3: 0, // Points not used for level3 and above (discount-based tiers)
    level2: 0,
    level1: 0
  }
  
  // Determine next tier based on current tier and points
  const getNextTier = (currentTier: string | undefined, points: number) => {
    if (!currentTier) return null;
    
    switch(currentTier) {
      case "level7": return points >= tierThresholds.level6 ? "level6" : null;
      case "level6": return points >= tierThresholds.level5 ? "level5" : null;
      case "level5": return points >= tierThresholds.level4 ? "level4" : null;
      case "level4": return points >= tierThresholds.level3 ? "level3" : null;
      default: return null; // No automatic upgrades for level3 and above
    }
  }
  
  const nextTier = getNextTier(membership?.tier, membership?.points || 0)
  
  // Calculate points to next tier
  const getPointsToNextTier = (currentTier: string | undefined, points: number) => {
    if (!currentTier) return 0;
    
    switch(currentTier) {
      case "level7": return Math.max(0, tierThresholds.level6 - points);
      case "level6": return Math.max(0, tierThresholds.level5 - points);
      case "level5": return Math.max(0, tierThresholds.level4 - points);
      default: return 0; // No point requirements for level4 and above
    }
  }
  
  const pointsToNextTier = getPointsToNextTier(membership?.tier, membership?.points || 0)
  
  // Check if eligible for upgrade
  const isEligibleForUpgrade = nextTier !== null
  
  // Fetch membership data
  const fetchMembership = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/membership/current")
      
      if (response.status === 401 || response.status === 404) {
        // User not logged in or membership not found
        setMembership(null)
        return
      }
      
      if (!response.ok) {
        console.error("Failed to fetch membership")
        return
      }
      
      const data = await response.json()
      setMembership(data)
    } catch (error) {
      console.error("Error fetching membership:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Refresh membership data
  const refreshMembership = async () => {
    await fetchMembership()
  }
  
  // Add points to membership
  const addPoints = async (points: number) => {
    if (!membership) return
    
    try {
      const newPoints = membership.points + points
      
      const response = await fetch("/api/membership/current", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: newPoints,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update points")
      }
      
      const data = await response.json()
      
      // Check if tier changed
      if (data.tier !== membership.tier) {
        toast.success(`Congratulations! You've been upgraded to ${data.tier} tier!`)
      } else {
        toast.success(`Added ${points} points to your membership!`)
      }
      
      // Update local state
      setMembership({
        ...membership,
        points: newPoints,
        tier: data.tier,
      })
    } catch (error) {
      console.error("Error adding points:", error)
      toast.error("Failed to update membership points")
    }
  }
  
  // Fetch membership on component mount (only in browser)
  useEffect(() => {
    // Delay initial fetch to ensure client-side only execution
    const timer = setTimeout(() => {
      fetchMembership()
      
      // Listen for auth state changes
      const handleAuthChange = () => {
        fetchMembership()
      }
      
      window.addEventListener("auth-state-change", handleAuthChange)
      
      return () => {
        window.removeEventListener("auth-state-change", handleAuthChange)
      }
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <MembershipContext.Provider value={{
      membership,
      isLoading,
      tierDiscount,
      pointsToNextTier,
      isEligibleForUpgrade,
      nextTier,
      addPoints,
      refreshMembership
    }}>
      {children}
    </MembershipContext.Provider>
  )
}

export const useMembership = () => {
  const context = useContext(MembershipContext)
  
  if (context === undefined) {
    throw new Error("useMembership must be used within a MembershipProvider")
  }
  
  return context
}
