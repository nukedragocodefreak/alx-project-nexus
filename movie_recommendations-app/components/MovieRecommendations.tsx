import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search,
    SlidersHorizontal,
    Star,
    Sparkles,
    Film,
    Heart,
    Plus,
    Info,
    Play,
    Clock,
    X,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,       
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

//--- Config ------------------------------------------------------------------------------------
const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1496440737103-cd596325d314?q=80&w=1200&auto=format&fit=crop";
const GENRES  = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary","Drama",
  "Fantasy","History","Horror","Mystery","Romance","Sci-Fi","Thriller",
];