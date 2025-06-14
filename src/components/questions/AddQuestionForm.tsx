
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddQuestionSchema, type AddQuestionFormInput } from '@/lib/types';
import { addQuestionAction } from '@/lib/actions/questionActions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DIFFICULTIES, PLATFORMS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface AddQuestionFormProps {
  onFormSubmitSuccess: () => void;
}

export function AddQuestionForm({ onFormSubmitSuccess }: AddQuestionFormProps) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddQuestionFormInput>({
    resolver: zodResolver(AddQuestionSchema),
    defaultValues: {
      title: '',
      link: '',
      description: '',
      difficulty: undefined,
      platform: undefined,
      topicName: '',
      comments: '',
      userId: '', // Will be set from auth context
    },
  });

  React.useEffect(() => {
    if (user) {
      form.setValue('userId', user.uid);
    }
  }, [user, form]);

  async function onSubmit(values: AddQuestionFormInput) {
    if (!user?.uid) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add a question.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addQuestionAction({ ...values, userId: user.uid });
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset({ 
          title: '', link: '', description: '', difficulty: undefined, 
          platform: undefined, topicName: '', comments: '', userId: user.uid 
        });
        onFormSubmitSuccess();
      } else {
        toast({
          title: result.message || 'Error Adding Question',
          description: result.error || 'An error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected client-side error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Two Sum" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://leetcode.com/problems/two-sum/" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="topicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Arrays" {...field} />
              </FormControl>
              <FormDescription>Enter the main topic for this question.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the question or your approach."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes/Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any personal notes, hints, or reflections."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || authLoading || !user}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add Question'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
