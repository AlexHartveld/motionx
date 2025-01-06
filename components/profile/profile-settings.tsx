'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserSettings } from '@/lib/types';

type SliderValue = number[];

export function ProfileSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/user/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Settings updated successfully',
        });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Preferences</h2>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings?.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setSettings((prev) => ({ ...prev!, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and achievements
                  </p>
                </div>
                <Switch
                  checked={settings?.soundEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setSettings((prev) => ({ ...prev!, soundEnabled: checked }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="focus-duration">
                <AccordionTrigger>Focus Session Duration</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Focus Duration (minutes)</Label>
                        <span className="text-sm text-muted-foreground">
                          {settings?.focusDuration} min
                        </span>
                      </div>
                      <Slider
                        value={[settings?.focusDuration || 25]}
                        onValueChange={(value: SliderValue) =>
                          setSettings((prev) => ({
                            ...prev!,
                            focusDuration: value[0],
                          }))
                        }
                        min={1}
                        max={120}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Break Duration (minutes)</Label>
                        <span className="text-sm text-muted-foreground">
                          {settings?.breakDuration} min
                        </span>
                      </div>
                      <Slider
                        value={[settings?.breakDuration || 5]}
                        onValueChange={(value: SliderValue) =>
                          setSettings((prev) => ({
                            ...prev!,
                            breakDuration: value[0],
                          }))
                        }
                        min={1}
                        max={30}
                        step={1}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={settings?.notificationsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setSettings((prev) => ({
                      ...prev!,
                      notificationsEnabled: checked,
                    }))
                  }
                />
              </div>

              {settings?.notificationsEnabled && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded of scheduled focus sessions
                      </p>
                    </div>
                    <Switch
                      checked={settings?.sessionReminders}
                      onCheckedChange={(checked: boolean) =>
                        setSettings((prev) => ({
                          ...prev!,
                          sessionReminders: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Goal Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about goal progress
                      </p>
                    </div>
                    <Switch
                      checked={settings?.goalNotifications}
                      onCheckedChange={(checked: boolean) =>
                        setSettings((prev) => ({
                          ...prev!,
                          goalNotifications: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full mt-6">
          Save Settings
        </Button>
      </Card>
    </div>
  );
} 